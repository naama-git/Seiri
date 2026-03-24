import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileMetadata } from './file.entity';
import { BusinessException } from 'src/core/exception.model';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileMetadata)
    private readonly fileRepository: Repository<FileMetadata>,
  ) {}

  async getAllFiles(userId: string): Promise<FileMetadata[]> {
    try {
      const files = await this.fileRepository.find({
        where: { item: { owner: { id: userId } } },
      });
      if (!files) {
        return [];
      }
      return files;
    } catch (error) {
      throw new BusinessException(
        'Database error',
        400,
        (error as Error).message,
        this.getAllFiles.name,
        this.constructor.name,
      );
    }
  }
}
