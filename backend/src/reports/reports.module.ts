import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. Import cái này
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity'; // 2. Import Entity Report
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    HttpModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule { }