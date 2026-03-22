import { Module } from '@nestjs/common';
import { FileSystemItemService } from './file-system-item.service';
import { FileSystemItemController } from './file-system-item.controller';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [UserService],
  providers: [FileSystemItemService],
  controllers: [FileSystemItemController],
})
export class FileSystemItemModule {}
