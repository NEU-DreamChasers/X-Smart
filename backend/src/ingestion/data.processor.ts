// src/ingestion/data.processor.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AdapterFactory } from './factory/adapter.factory';
import { ScorpioService } from '../scorpio/scorpio.service';

interface KafkaMessage {
  sourceType: string;
  payload: Record<string, any>;
}

@Controller()
export class DataProcessor {
  private readonly logger = new Logger(DataProcessor.name);

  constructor(
    private readonly adapterFactory: AdapterFactory,
    private readonly scorpioService: ScorpioService,
  ) {}

  // Lắng nghe Topic 'raw_data_topic'
  @EventPattern('raw_data_topic')
  async handleRawData(@Payload() message: KafkaMessage) {
    const { sourceType, payload } = message;

    this.logger.log(`--- [Consumer] Nhận dữ liệu loại: ${sourceType} ---`);

    try {
      // 1. Chọn Adapter (Logic cũ của bạn tái sử dụng ở đây)
      const adapter = this.adapterFactory.getAdapter(sourceType);

      // 2. Convert sang NGSI-LD
      const ngsiEntity = await adapter.convert(payload);

      // 3. Đẩy vào Scorpio
      await this.scorpioService.publishEntity(ngsiEntity);

      this.logger.log(`[Consumer] Xử lý xong & Đẩy thành công: ${ngsiEntity.id}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`[Consumer] Lỗi xử lý: ${err.message}`);
    }
  }
}
