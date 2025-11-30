import { Test, TestingModule } from '@nestjs/testing';
import { ScorpioService } from './scorpio.service';

describe('ScorpioService', () => {
  let service: ScorpioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScorpioService],
    }).compile();

    service = module.get<ScorpioService>(ScorpioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
