/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Module, Global } from '@nestjs/common';
import { UploadService } from './upload.service';
import { MinioClientModule } from '../minio-client/minio-client.module';

@Global()
@Module({
  imports: [MinioClientModule],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule { }