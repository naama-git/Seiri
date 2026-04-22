import { Module } from '@nestjs/common';
import { FileSystemItemService } from './file-system-item.service';
import { FileSystemItemController } from './file-system-item.controller';
import { FileSystemItem } from './file-system-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '@/file/file.module';
import { UserModule } from '@/user/user.module';
import { FileMetadata } from '@/file/file.entity';
import { User } from '@/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileSystemItem, FileMetadata, User]), UserModule, FileModule],
  providers: [FileSystemItemService],
  controllers: [FileSystemItemController],
  exports: [FileSystemItemService],
})
export class FileSystemItemModule {}
