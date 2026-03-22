import { Injectable } from '@nestjs/common';
import {
  CreateFileSystemItemDto,
  ReadFileSystemItemDto,
  UpdatePlainFileSystemItemDto,
} from './file-system-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystemItem } from './file-system-item.entity';
import { TreeRepository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { BusinessException } from 'src/core/exception.model';

@Injectable()
export class FileSystemItemService {
  constructor(
    @InjectRepository(FileSystemItem)
    private readonly itemRepository: TreeRepository<FileSystemItem>,
    private readonly userService: UserService,
  ) {}

  async createFileSystemItem(item: CreateFileSystemItemDto, userId: string) {}

  async getRootFolder(userId: string) {
    const user: User | null = await this.userService.findRawUserById(userId);
    if (user == null) {
      throw new BusinessException(
        'user not found',
        404,
        'User with id ' + userId + ' not found',
        'getRootFolder',
        'FileSystemItemService',
      );
    }
    const rootFolder: FileSystemItem | null =
      await this.itemRepository.findOneBy({
        owner: user,
      });

    if (rootFolder == null) {
      throw new BusinessException(
        'Root folder not found',
        404,
        'Root folder with user id ' + userId + ' not found',
        'getRootFolder',
        'FileSystemItemService',
      );
    }

    return new ReadFileSystemItemDto(rootFolder);
  }

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
