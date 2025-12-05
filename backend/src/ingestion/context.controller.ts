/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  UseGuards, Res, ParseIntPipe, DefaultValuePipe
} from '@nestjs/common';
import type { Response } from 'express';
import { AdapterFactory } from './factory/adapter.factory';
import { ScorpioService } from '../scorpio/scorpio.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { IngestionService } from './ingestion.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@ApiTags('Ingestion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ContextController {
  private readonly logger = new Logger(ContextController.name);

  constructor(
    private readonly adapterFactory: AdapterFactory,
    private readonly scorpioService: ScorpioService,
    private readonly httpService: HttpService,
    private readonly ingestionService: IngestionService,
  ) {}

  // --- HÀM TIỆN ÍCH: ĐOÁN URN TỪ ID NGẮN ---
  private guessUrn(domain: string, shortId: string): string {
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
        return `urn:ngsi-ld:Thing:${domain}:${shortId}`;
    }
  }

  // POST: Import dữ liệu tĩnh (ADMIN ONLY)
  @Post('admin/import-static')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Kích hoạt Import dữ liệu tĩnh (Admin Only)' })
  async triggerImport(@Query('category') category: string = 'bus'): Promise<unknown> {
    return this.ingestionService.importStaticCityData(category);
  }

  // GET: Tìm kiếm bãi đỗ xe xung quanh địa điểm được yêu cầu
  @Get('map/search-nearby')
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm địa điểm xung quanh' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lon', required: true })
  @ApiQuery({ name: 'category', enum: ['bus', 'parking', 'poi'], required: false, description: 'Mặc định là parking' })
  @ApiQuery({ name: 'radius', required: false })
  async searchNearby(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
    @Query('category') category: string = 'parking',
    @Query('radius') radius: number = 1000,
  ): Promise<any[]> {
    let query = '';
    let adapterType = 'overpass_parking';

    if (category === 'parking') {
      query = `[out:json][timeout:25];(node(around:${radius},${lat},${lon})["amenity"="parking"];way(around:${radius},${lat},${lon})["amenity"="parking"];);out center;`;
      adapterType = 'overpass_parking';
    } else if (category === 'bus') {
      query = `[out:json][timeout:25];node(around:${radius},${lat},${lon})["highway"="bus_stop"];out;`;
      adapterType = 'overpass_bus';
    } else {
      query = `[out:json][timeout:25];node(around:${radius},${lat},${lon})["amenity"];out;`;
      adapterType = 'overpass_poi';
    }

    const apiUrl = `https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=${encodeURIComponent(query)}`;

    this.logger.debug(`Calling Overpass: ${apiUrl}`);

    try {
      const response = await firstValueFrom(this.httpService.get(apiUrl));
      const rawDataList = response.data.elements || [];

      const adapter = this.adapterFactory.getAdapter(adapterType);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const ngsiList = rawDataList.map((item: any) => adapter.convert(item));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return ngsiList;
    } catch (error) {
      const err = error as { response?: { status: number; data: any }; message: string };
      if (err.response) {
        this.logger.error(`Overpass Error Status: ${err.response.status}`);
        this.logger.error(`Overpass Error Data: ${JSON.stringify(err.response.data)}`);
      } else {
        this.logger.error(`Network Error: ${err.message}`);
      }

      throw new HttpException('Lỗi kết nối Overpass API', HttpStatus.BAD_GATEWAY);
    }
  }

  // --- GET: Lấy tất cả dữ liệu theo domain ---
  @Get(':domain/status')
  @Public()
  @Header('Content-Type', 'application/ld+json')
  @ApiOperation({ summary: 'Lấy danh sách dữ liệu theo lĩnh vực (Weather, Air, Bus, Parking), hỗ trợ phân trang/lấy tất cả' })
  @ApiParam({ name: 'domain', example: 'weather', description: 'Lĩnh vực cần lấy dữ liệu' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng tối đa. Bỏ trống để lấy tất cả' })
  @ApiQuery({ name: 'offset', required: false, description: 'Vị trí bắt đầu' })
  @ApiQuery({ name: 'category', required: false, example: 'hospital', description: 'Lọc theo danh mục (dành cho POI)' })
  async getAllData(@Param('domain') domain: string, @Query('category') category?: string, @Query('limit') limit?: number, 
    @Query('offset') offset?: number, @Res({ passthrough: true }) res?: Response) {

    this.logger.log(`GET ALL Request cho domain: ${domain}, category: ${category}, limit=${limit}, offset=${offset}`);

    let type = '';
    let query = '';

    switch (domain) {
      case 'weather':
        type = 'WeatherObserved';
        break;
      case 'air':
        type = 'AirQualityObserved';
        break;
      case 'parking':
        type = 'OffStreetParking';
        break;
      case 'bus':
      case 'poi':
        type = 'PointOfInterest';
        if (domain === 'bus') query = 'category=="bus_stop"';
        if (category) query = `category=="${category}"`;
        break;
      default:
        throw new HttpException('Domain không hỗ trợ lấy danh sách', HttpStatus.BAD_REQUEST);
    }

    const result = await this.scorpioService.getEntitiesByType(type, query, limit, offset);
    if (res) {
      res.header('X-Total-Count', result.count.toString());
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.data;
  }

  // URI: GET /weather/status/device_01
  @Get(':domain/status/:id')
  @Public()
  @Header('Content-Type', 'application/ld+json')
  @ApiOperation({ summary: 'Lấy chi tiết một thiết bị/địa điểm theo ID' })
  @ApiParam({ name: 'id', example: 'device_01', description: 'ID thiết bị hoặc tên địa điểm' })
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

  // --- DELETE: Xóa dữ liệu ---
  // URI: DELETE /weather/status/device_01
  @Delete(':domain/status/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa dữ liệu thiết bị khỏi hệ thống (Admin Only)' })
  @ApiParam({
    name: 'id',
    example: 'device_01',
    description: 'ID thiết bị muốn xóa',
  })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ID để xóa.' })
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

  // --- POST: Tạo mới / Nhập liệu ---
  // URI: POST /weather/status/device_01
  @Post(':domain/status/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Header('Content-Type', 'application/ld+json')
  @ApiOperation({ summary: 'Gửi dữ liệu thô từ thiết bị lên hệ thống (Admin Only)' })
  @ApiBody({
    schema: { example: { main: { temp: 30 }, name: 'Sensor 1' } },
    description: 'Dữ liệu JSON thô từ cảm biến',
  })
  async createData(
    @Param('domain') domain: string,
    @Param('id') id: string,
    @Body() rawData: any,
    @Query('type') adapterType?: string,
  ) {
    return this.processIngestion(domain, id, rawData, adapterType);
  }

  // --- PUT: Cập nhật ---
  // URI: PUT /weather/status/device_01
  @Put(':domain/status/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Header('Content-Type', 'application/ld+json')
  @ApiOperation({ summary: 'Cập nhật dữ liệu cho thiết bị (Admin Only)' })
  @ApiParam({
    name: 'id',
    example: 'device_01',
    description: 'ID thiết bị cần cập nhật',
  })
  @ApiBody({
    description: 'Dữ liệu JSON mới cần cập nhật',
    schema: {
      example: {
        main: { temp: 35, humidity: 50 }, //Ví dụ nhiệt độ tăng lên
        wind: { speed: 10 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công, trả về dữ liệu mới.' })
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
      let typeToUse = adapterType;
      if (!typeToUse) {
        if (domain === 'weather' || domain === 'environment') typeToUse = 'openweathermap';
        else if (domain === 'air') typeToUse = 'openweathermap_aqi';
        else if (domain === 'bus') typeToUse = 'overpass_bus';
        else if (domain === 'parking') typeToUse = 'overpass_parking';
        else throw new Error(`Chưa hỗ trợ domain: ${domain}`);
      }

      const adapter = this.adapterFactory.getAdapter(typeToUse);
      const ngsiEntity = await adapter.convert(rawData);

      // Đảm bảo ID trong database khớp với ID trên URL mà người dùng gửi
      ngsiEntity.id = this.guessUrn(domain, id);

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