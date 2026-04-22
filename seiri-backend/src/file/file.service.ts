import { HttpStatus, Injectable } from '@nestjs/common';
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
        HttpStatus.NOT_FOUND,
        `User with id ${userId} was not found`,
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
        HttpStatus.INTERNAL_SERVER_ERROR,
        (error as Error).message,
      );
    }
  }

  async readFile(itemId: string): Promise<FileMetadata> {
    const file = await this.fileRepository.findOneBy({ item: { id: itemId } });
    if (!file || file === undefined) {
      throw new BusinessException(
        'File not found',
        HttpStatus.NOT_FOUND,
        `File with itemId ${itemId} not found`,
      );
    }
    return file;
  }
}
