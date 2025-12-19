import { Test, TestingModule } from '@nestjs/testing';
import { PopularProductsController } from './popular-products.controller';

describe('PopularProductsController', () => {
  let controller: PopularProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopularProductsController],
    }).compile();

    controller = module.get<PopularProductsController>(PopularProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
