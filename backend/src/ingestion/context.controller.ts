import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AdapterFactory } from './factory/adapter.factory';
import { ScorpioService } from '../scorpio/scorpio.service';

@Controller()
export class ContextController {
  private readonly logger = new Logger(ContextController.name);

  constructor(
    private readonly adapterFactory: AdapterFactory,
    private readonly scorpioService: ScorpioService,
  ) {}

  // --- HÀM TIỆN ÍCH: ĐOÁN URN TỪ ID NGẮN ---
  // Giúp chuyển đổi id ngắn (vd: device_1) thành URN chuẩn NGSI-LD
  private guessUrn(domain: string, shortId: string): string {
    // Nếu người dùng đã gửi URN đầy đủ thì giữ nguyên
    if (shortId.startsWith('urn:ngsi-ld:')) {
      return shortId;
    }

    // Logic map Domain -> Prefix ID
    switch (domain) {
      case 'weather':
      case 'environment':
        return `urn:ngsi-ld:WeatherObserved:OpenWeatherMap:${shortId}`;
      case 'air':
        return `urn:ngsi-ld:AirQualityObserved:OpenWeatherMap:${shortId}`;
      case 'bus':
        return `urn:ngsi-ld:PointOfInterest:OSM:bus_stop:${shortId}`;
      case 'parking':
        return `urn:ngsi-ld:OffStreetParking:OSM:${shortId}`;
      default:
        // Mặc định nếu không biết domain là gì
        return `urn:ngsi-ld:Thing:${domain}:${shortId}`;
    }
  }

  // --- 1. GET: Lấy dữ liệu chi tiết (READ) ---
  // URI: GET /weather/status
  // (Chú ý: Không có /:id ở cuối)
  @Get(':domain/status')
  @Header('Content-Type', 'application/ld+json')
  async getAllData(@Param('domain') domain: string) {
    this.logger.log(`GET ALL Request cho domain: ${domain}`);

    let type = '';
    let query = '';

    // 1. Map Domain sang Type chuẩn của Scorpio
    switch (domain) {
      case 'weather':
      case 'environment':
        type = 'https://smartdatamodels.org/dataModel.Weather/WeatherObserved';
        break;
      case 'air':
        type = 'https://smartdatamodels.org/dataModel.Environment/AirQualityObserved';
        break;
      case 'parking':
        type = 'OffStreetParking'; // Tên ngắn (do adapter lưu tên ngắn)
        break;
      case 'bus':
        type = 'https://smartdatamodels.org/dataModel.PointOfInterest/PointOfInterest';
        // Với Bus, phải lọc thêm category
        query = 'category=="bus_stop"';
        break;
      default:
        throw new HttpException('Domain không hỗ trợ lấy danh sách', HttpStatus.BAD_REQUEST);
    }

    // 2. Gọi Service
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.scorpioService.getEntitiesByType(type, query);
  }

  // URI: GET /weather/status/device_01
  @Get(':domain/status/:id')
  @Header('Content-Type', 'application/ld+json')
  async getData(@Param('domain') domain: string, @Param('id') id: string) {
    try {
      const urn = this.guessUrn(domain, id);
      this.logger.log(`GET Request cho URN: ${urn}`);

      const data = (await this.scorpioService.getEntity(urn)) as Record<string, any>;
      return data;
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Không tìm thấy dữ liệu',
          message: err.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // --- 2. DELETE: Xóa dữ liệu (DELETE) ---
  // URI: DELETE /weather/status/device_01
  @Delete(':domain/status/:id')
  async deleteData(@Param('domain') domain: string, @Param('id') id: string) {
    try {
      const urn = this.guessUrn(domain, id);
      this.logger.log(`DELETE Request cho URN: ${urn}`);

      await this.scorpioService.deleteEntity(urn);
      return { message: `Đã xóa thành công thiết bị: ${id}`, urn };
    } catch (error) {
      const err = error as Error;
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Xóa thất bại',
          message: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --- 3. POST: Tạo mới / Nhập liệu (CREATE) ---
  // URI: POST /weather/status/device_01
  @Post(':domain/status/:id')
  @Header('Content-Type', 'application/ld+json')
  async createData(
    @Param('domain') domain: string,
    @Param('id') id: string,
    @Body() rawData: any,
    @Query('type') adapterType?: string,
  ) {
    return this.processIngestion(domain, id, rawData, adapterType);
  }

  // --- 4. PUT: Cập nhật (UPDATE) ---
  // URI: PUT /weather/status/device_01
  // Trong ngữ cảnh này, PUT hoạt động giống POST (Upsert)
  @Put(':domain/status/:id')
  @Header('Content-Type', 'application/ld+json')
  async updateData(
    @Param('domain') domain: string,
    @Param('id') id: string,
    @Body() rawData: any,
    @Query('type') adapterType?: string,
  ) {
    this.logger.log(`PUT Request (Update) cho: ${id}`);
    return this.processIngestion(domain, id, rawData, adapterType);
  }

  // --- LOGIC CHUNG CHO POST & PUT ---
  private async processIngestion(domain: string, id: string, rawData: any, adapterType?: string) {
    this.logger.log(`Processing Ingestion cho domain: ${domain}, ID: ${id}`);

    try {
      // A. Xác định Adapter
      let typeToUse = adapterType;
      if (!typeToUse) {
        if (domain === 'weather' || domain === 'environment') typeToUse = 'openweathermap';
        else if (domain === 'air') typeToUse = 'openweathermap_aqi';
        else if (domain === 'bus') typeToUse = 'overpass_bus';
        else if (domain === 'parking') typeToUse = 'overpass_parking';
        else throw new Error(`Chưa hỗ trợ domain: ${domain}`);
      }

      // B. Convert
      const adapter = this.adapterFactory.getAdapter(typeToUse);
      const ngsiEntity = await adapter.convert(rawData);

      // C. GHI ĐÈ ID (Quan trọng)
      // Để đảm bảo ID trong database khớp với ID trên URL mà người dùng gửi
      ngsiEntity.id = this.guessUrn(domain, id);

      // D. Lưu vào Scorpio
      await this.scorpioService.publishEntity(ngsiEntity);

      return ngsiEntity;
    } catch (error) {
      const err = error as Error;
      this.logger.error(err);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Xử lý dữ liệu thất bại',
          message: err.message || err,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
