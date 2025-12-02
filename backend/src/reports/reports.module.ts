import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity';
import { HttpModule } from '@nestjs/axios';
import { UploadModule } from 'src/upload/upload.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    HttpModule,
    UploadModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule { }