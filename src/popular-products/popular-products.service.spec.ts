import { Test, TestingModule } from '@nestjs/testing';
import { PopularProductsService } from './popular-products.service';

describe('PopularProductsService', () => {
  let service: PopularProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopularProductsService],
    }).compile();

    service = module.get<PopularProductsService>(PopularProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
