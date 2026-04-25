import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FileMetadata } from './file.entity';
import { BusinessException } from 'src/core/exception.model';
import { CraeteFileDto } from './file.dto';
import { FileSystemItem } from '@/file-system-item/file-system-item.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileMetadata)
    private readonly fileRepository: Repository<FileMetadata>,
  ) {}

  async createFile(dto: CraeteFileDto, item: FileSystemItem, manager: EntityManager) {
    const file = {
      mimeType: dto.mimeType,
      extension: dto.extension,
      size: dto.size,
      item,
    };

    if (manager) {
      return await manager.save(FileMetadata, file);
    } else {
      return await this.fileRepository.save(file);
    }
  }

  async readFile(itemId: string): Promise<FileMetadata> {
    const file = await this.fileRepository.findOneBy({ item: { id: itemId } });
    if (!file || file === undefined) {
      throw new BusinessException('File not found', HttpStatus.NOT_FOUND, `File with itemId ${itemId} not found`);
    }
    return file;
  }
}
