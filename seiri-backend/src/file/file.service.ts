import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileMetadata } from './file.entity';
import { BusinessException } from 'src/core/exception.model';
import { CraeteFileDto } from './file.dto';
import { UserService } from '@/user/user.service';
import { FileSystemItem } from '@/file-system-item/file-system-item.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileMetadata)
    private readonly fileRepository: Repository<FileMetadata>,
    private readonly userService: UserService,
  ) {}

  async createFile(dto: CraeteFileDto, userId: string, item: FileSystemItem) {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException(
        'User not found',
        404,
        `User with id ${userId} was not found`,
        this.createFile.name,
        this.constructor.name,
      );
    }
    const file = this.fileRepository.create({
      mimeType: dto.mimeType,
      extension: dto.extension,
      size: dto.size,
      item,
    });

    try {
      return await this.fileRepository.save(file);
    } catch (error) {
      throw new BusinessException(
        'Internal server error',
        500,
        (error as Error).message,
        this.createFile.name,
        this.constructor.name,
      );
    }
  }
}
