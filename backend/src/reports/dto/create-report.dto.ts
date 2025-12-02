import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportDto {
    @IsNotEmpty()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lat?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lon?: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    guestName?: string;

    @IsOptional()
    @IsString()
    guestPhone?: string;
}