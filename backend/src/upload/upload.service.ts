/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, BadRequestException } from '@nestjs/common';
import { MinioClientService } from '../minio-client/minio-client.service';

@Injectable()
export class UploadService {
    constructor(private readonly minioClientService: MinioClientService) { }

    async uploadReportImage(file: Express.Multer.File) {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            throw new BadRequestException('Chỉ chấp nhận file ảnh!');
        }

        const result = await this.minioClientService.uploadFile(file);
        return result.url;
    }
}