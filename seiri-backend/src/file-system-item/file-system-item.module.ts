import { Module } from '@nestjs/common';
import { FileSystemItemService } from './file-system-item.service';
import { FileSystemItemController } from './file-system-item.controller';
import { FileSystemItem } from './file-system-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileSystemItem, User])],
  providers: [FileSystemItemService, UserService],
  controllers: [FileSystemItemController],
  exports: [FileSystemItemService],
})
export class FileSystemItemModule {}
