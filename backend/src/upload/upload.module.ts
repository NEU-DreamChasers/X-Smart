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