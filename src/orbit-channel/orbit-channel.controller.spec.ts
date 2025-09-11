import { Test, TestingModule } from '@nestjs/testing';
import { OrbitChannelController } from './orbit-channel.controller';

describe('OrbitChannelController', () => {
  let controller: OrbitChannelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrbitChannelController],
    }).compile();

    controller = module.get<OrbitChannelController>(OrbitChannelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
