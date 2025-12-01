import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus } from '../entities/report.entity';

export class ReportFilterDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsEnum(ReportStatus)
    status?: ReportStatus;

    @IsOptional()
    @IsString()
    search?: string;
}