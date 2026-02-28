import { Test, TestingModule } from '@nestjs/testing';
import { FileSystemItemService } from './file-system-item.service';

describe('FileSystemItemService', () => {
  let service: FileSystemItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileSystemItemService],
    }).compile();

    service = module.get<FileSystemItemService>(FileSystemItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
