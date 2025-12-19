import { Test, TestingModule } from '@nestjs/testing';
import { FeaturedCategoriesController } from './featured-categories.controller';

describe('FeaturedCategoriesController', () => {
  let controller: FeaturedCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeaturedCategoriesController],
    }).compile();

    controller = module.get<FeaturedCategoriesController>(FeaturedCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
