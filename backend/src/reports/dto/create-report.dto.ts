import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateReportDto {
    @IsNotEmpty()
    title: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    lat?: number;

    @IsOptional()
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