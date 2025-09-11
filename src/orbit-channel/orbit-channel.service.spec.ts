import { Test, TestingModule } from '@nestjs/testing';
import { OrbitChannelService } from './orbit-channel.service';

describe('OrbitChannelService', () => {
  let service: OrbitChannelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrbitChannelService],
    }).compile();

    service = module.get<OrbitChannelService>(OrbitChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
