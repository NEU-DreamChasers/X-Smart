/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MinioClientService {
    private readonly logger = new Logger(MinioClientService.name);

    private readonly bucketName: string;

    constructor(
        private readonly minio: MinioService,
        private readonly configService: ConfigService,
    ) {
        this.bucketName = this.configService.get('MINIO_BUCKET') || 'reports';
    }

    public async uploadFile(file: Express.Multer.File) {
        const tempFilename = Date.now().toString();
        const hashedFileName = crypto.createHash('md5').update(tempFilename).digest("hex");
        const ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        const filename = `${hashedFileName}${ext}`;
        const bucketExists = await this.minio.client.bucketExists(this.bucketName);
        if (!bucketExists) {
            await this.minio.client.makeBucket(this.bucketName, 'us-east-1');
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                    },
                ],
            };
            await this.minio.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        }
        try {
            await this.minio.client.putObject(
                this.bucketName,
                filename,
                file.buffer,
                file.size,
                { 'Content-Type': file.mimetype }
            );

            return {
                url: `http://${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${this.bucketName}/${filename}`,
                filename: filename
            };
        } catch (error) {
            this.logger.error(error);
            throw new HttpException('Lỗi upload ảnh sang MinIO', HttpStatus.BAD_REQUEST);
        }
    }
}