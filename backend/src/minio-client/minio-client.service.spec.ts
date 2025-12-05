/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Test, TestingModule } from '@nestjs/testing';
import { MinioClientService } from './minio-client.service';

describe('MinioClientService', () => {
  let service: MinioClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinioClientService],
    }).compile();

    service = module.get<MinioClientService>(MinioClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
