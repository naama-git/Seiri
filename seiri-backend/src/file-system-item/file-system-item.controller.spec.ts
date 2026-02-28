import { Test, TestingModule } from '@nestjs/testing';
import { FileSystemItemController } from './file-system-item.controller';

describe('FileSystemItemController', () => {
  let controller: FileSystemItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileSystemItemController],
    }).compile();

    controller = module.get<FileSystemItemController>(FileSystemItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
