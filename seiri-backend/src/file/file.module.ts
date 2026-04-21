import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { UserService } from '@/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileMetadata } from './file.entity';
import { UserModule } from '@/user/user.module';
import { FileSystemItemModule } from '@/file-system-item/file-system-item.module';
import { User } from '@/user/user.entity';
import { FileSystemItem } from '@/file-system-item/file-system-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileMetadata, User, FileSystemItem]),
    UserModule,
    // FileSystemItemModule,
  ],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
