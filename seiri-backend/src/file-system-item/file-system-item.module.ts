import { Module } from '@nestjs/common';
import { FileSystemItemService } from './file-system-item.service';
import { FileSystemItemController } from './file-system-item.controller';

@Module({
  providers: [FileSystemItemService],
  controllers: [FileSystemItemController],
})
export class FileSystemItemModule {}
