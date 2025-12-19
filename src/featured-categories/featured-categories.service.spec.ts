import { Test, TestingModule } from '@nestjs/testing';
import { FeaturedCategoriesService } from './featured-categories.service';

describe('FeaturedCategoriesService', () => {
  let service: FeaturedCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeaturedCategoriesService],
    }).compile();

    service = module.get<FeaturedCategoriesService>(FeaturedCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
