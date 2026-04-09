import { Injectable } from '@nestjs/common';
import { CreateItemDto, UpdateItemDTO } from './file-system-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystemItem, ItemType } from './file-system-item.entity';
import { IsNull, TreeRepository } from 'typeorm';
// import { UserService } from 'src/user/user.service';
import { BusinessException } from 'src/core/exception.model';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FileSystemItemService {
  constructor(
    @InjectRepository(FileSystemItem)
    private readonly itemRepository: TreeRepository<FileSystemItem>,
    private readonly userService: UserService,
  ) {}

  async createFileSystemItem(item: CreateItemDto, userId: string) {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException(
        'User not Found',
        404,
        `Error in input data: User with Id ${userId} was not found.`,
        this.createFileSystemItem.name,
        this.constructor.name,
      );
    }
    //-----------------------------
    // ... A very long logic for filling in the remaining fields in the item
    //-----------------------------

    if (item.type === ItemType.FILE) {
      // logic ...
    }
    const newItem = this.itemRepository.create({ ...item, owner: user });

    try {
      return await this.itemRepository.save(newItem);
    } catch (error) {
      throw new BusinessException(
        'Internal Server Error',
        500,
        (error as Error).message,
        this.createFileSystemItem.name,
        this.constructor.name,
      );
    }
  }

  async getRootFolder(userId: string) {
    const rootFolder = await this.itemRepository.findOne({
      where: {
        owner: { id: userId },
        parent: IsNull(),
        type: ItemType.FOLDER,
      },
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
  }

  async createRootFolder(userId: string) {
    const rootFolder = this.itemRepository.create({
      name: 'root-folder',
      type: ItemType.FOLDER,
    });
    await this.itemRepository.save(rootFolder);
    return rootFolder;
  }

  async getFileSystemItemById(id: string, userId: string) {
    const item = await this.itemRepository.findOne({
      where: {
        id: id,
        owner: { id: userId },
      },
    });
    if (item == null) {
      throw new BusinessException(
        'Item not found',
        404,
        'Item with id ' + id + ' not found',
        'readFileSystemItemById',
        'FileSystemItemService',
      );
    }
  }

  async getAllFileSystemItems(userId: string) {}

  async updateFileSystemItem(id: string, item: UpdateItemDTO, userId: string) {}

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

  async getSize(id: string, userId: string) {}
}
