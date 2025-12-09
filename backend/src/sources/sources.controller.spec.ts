/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Test, TestingModule } from '@nestjs/testing';
import { SourcesController } from './sources.controller';

describe('SourcesController', () => {
  let controller: SourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourcesController],
    }).compile();

    controller = module.get<SourcesController>(SourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
