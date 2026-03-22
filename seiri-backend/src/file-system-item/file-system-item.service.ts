import { Injectable } from '@nestjs/common';
import {
  CreateFileSystemItemDto,
  UpdatePlainFileSystemItemDto,
} from './file-system-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystemItem } from './file-system-item.entity';
import { TreeRepository } from 'typeorm';

@Injectable()
export class FileSystemItemService {
  constructor(
    @InjectRepository(FileSystemItem)
    private readonly itemRepository: TreeRepository<FileSystemItem>,
  ) {}

  async createFileSystemItem(item: CreateFileSystemItemDto, userId: string) {}

  async getRootFolder(userId: string) {}

  async readFileSystemItemById(id: string, userId: string) {}

  async readAllFileSystemItems(userId: string) {}

  async updateFileSystemItem(
    id: string,
    item: UpdatePlainFileSystemItemDto,
    userId: string,
  ) {}

  async deleteFileSystemItem(id: string, userId: string) {}

  async moveFileSystemItem(
    id: string,
    newParentId: string | null,
    userId: string,
  ) {}

  async copyFileSystemItem(
    id: string,
    newParentId: string | null,
    userId: string,
  ) {}

  async getSize(id: string, userId: string);
}
