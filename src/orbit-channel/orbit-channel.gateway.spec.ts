import { Test, TestingModule } from '@nestjs/testing';
import { OrbitChannelGateway } from './orbit-channel.gateway';

describe('OrbitChannelGateway', () => {
  let gateway: OrbitChannelGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrbitChannelGateway],
    }).compile();

    gateway = module.get<OrbitChannelGateway>(OrbitChannelGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
