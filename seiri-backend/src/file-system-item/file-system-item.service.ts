import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateItemDto, UpdateItemDTO } from './file-system-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystemItem, ItemType } from './file-system-item.entity';
import { DataSource, IsNull, TreeRepository } from 'typeorm';
import { BusinessException } from '@/core/exception.model';
import { UserService } from '../user/user.service';
import { User } from '@/user/user.entity';
import { FileService } from '@/file/file.service';

@Injectable()
export class FileSystemItemService {
  constructor(
    @InjectRepository(FileSystemItem)
    private readonly itemRepository: TreeRepository<FileSystemItem>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private dataSource: DataSource,
  ) {}

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async assertItemOwnership(id: string, userId: string): Promise<FileSystemItem> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['owner', 'metadata', 'parent'],
    });

    if (!item) {
      throw new BusinessException('Item not found', HttpStatus.NOT_FOUND, `Item with id ${id} not found`);
    }

    if (item.owner.id !== userId) {
      throw new BusinessException('Forbidden', HttpStatus.FORBIDDEN, `User ${userId} does not own item ${id}`);
    }

    return item;
  }

  /**
   * Guard against moving/copying an item into one of its own descendants,
   * which would create a cycle in the tree.
   */
  private async assertNotAncestor(itemId: string, targetParentId: string): Promise<void> {
    // Walk up the target's ancestors to see if itemId appears
    let current = await this.itemRepository.findOne({
      where: { id: targetParentId },
      relations: ['parent'],
    });

    while (current) {
      if (current.id === itemId) {
        throw new BusinessException(
          'Invalid operation',
          HttpStatus.BAD_REQUEST,
          'Cannot move an item into one of its own descendants',
        );
      }
      current = current.parent
        ? await this.itemRepository.findOne({
            where: { id: current.parent.id },
            relations: ['parent'],
          })
        : null;
    }
  }

  /**
   * Recursively clone an item and all its children under a new parent.
   * Returns the saved root of the clone tree.
   */
  private async deepCopyItem(
    source: FileSystemItem,
    newParent: FileSystemItem | null,
    owner: User,
  ): Promise<FileSystemItem> {
    // Load children if not already loaded
    const sourceWithChildren = await this.itemRepository.findOne({
      where: { id: source.id },
      relations: ['children', 'metadata'],
    });

    if (!sourceWithChildren) {
      throw new BusinessException('Item not found', HttpStatus.NOT_FOUND, `Item ${source.id} disappeared during copy`);
    }

    const clone = this.itemRepository.create({
      name: newParent ? sourceWithChildren.name : `${sourceWithChildren.name} (copy)`,
      type: sourceWithChildren.type,
      owner,
      parent: newParent,
    });

    const savedClone = await this.itemRepository.save(clone);

    // Recursively copy children
    if (sourceWithChildren.children?.length) {
      for (const child of sourceWithChildren.children) {
        await this.deepCopyItem(child, savedClone, owner);
      }
    }

    return savedClone;
  }

  // ─── Public API ───

  async createFileSystemItem(item: CreateItemDto, userId: string): Promise<FileSystemItem | undefined> {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException('User not found', HttpStatus.NOT_FOUND, `User with id ${userId} was not found`);
    }

    // Resolve parent if provided
    let parent: FileSystemItem | null = null;
    if (item.parentId) {
      parent = await this.itemRepository.findOne({
        where: { id: item.parentId, owner: { id: userId } },
      });

      if (!parent) {
        throw new BusinessException(
          'Parent not found',
          HttpStatus.NOT_FOUND,
          `Parent folder with id ${item.parentId} not found or not owned by user`,
        );
      }

      if (parent.type !== ItemType.FOLDER) {
        throw new BusinessException(
          'Invalid parent',
          HttpStatus.BAD_REQUEST,
          `Parent item ${item.parentId} is not a folder`,
        );
      }
    }

    const newItem = this.itemRepository.create({
      name: item.name,
      type: item.type,
      owner: user,
      parent,
    });

    try {
      if (newItem.type == ItemType.FOLDER) {
        return await this.itemRepository.save(newItem);
      }
      await this.dataSource.transaction(async (menager) => {
        const savedItem = await menager.save(newItem);
        await this.fileService.createFile({ size: 0, mimeType: '', extension: '' }, userId, savedItem);
      });
    } catch (error) {
      throw new BusinessException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, (error as Error).message);
    }
  }

  async getRootFolder(userId: string): Promise<FileSystemItem> {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException('User not found', HttpStatus.NOT_FOUND, `User with id ${userId} not found`);
    }

    // Prefer the explicit rootFolder relation on the User entity
    if (user.rootFolder) {
      return user.rootFolder;
    }

    // Fall back to querying by owner + null parent
    let rootFolder = await this.itemRepository.findOne({
      where: {
        owner: { id: userId },
        parent: IsNull(),
        type: ItemType.FOLDER,
      },
    });

    if (!rootFolder) {
      rootFolder = await this.createRootFolder(userId);
    }
    console.log(rootFolder);
    return rootFolder;
  }

  async createRootFolder(userId: string): Promise<FileSystemItem> {
    const rootFolder = await this.createFileSystemItem(
      {
        type: ItemType.FOLDER,
        name: `root-folder-${userId}`,
        parentId: undefined,
      },
      userId,
    );

    if (rootFolder === undefined) {
      throw new BusinessException(
        'Root folder is undefined',
        HttpStatus.NOT_FOUND,
        `Root folder with name root-folder-${userId} not found`,
      );
    }
    return rootFolder;
  }

  async getItemById(id: string, userId: string): Promise<FileSystemItem | FileSystemItem[]> {
    const item = await this.itemRepository.findOne({
      where: { id, owner: { id: userId } },
      relations: ['metadata', 'owner'],
    });

    if (!item) {
      throw new BusinessException('Item not found', 404, `Item with id ${id} not found`);
    }

    if (item.type === ItemType.FOLDER) {
      // Use the tree repository to get direct children only
      const tree = await this.itemRepository.findDescendantsTree(item, {
        depth: 1,
      });
      return tree.children ?? [];
    }

    return item;
  }

  async updateFileSystemItem(id: string, dto: UpdateItemDTO, userId: string): Promise<FileSystemItem> {
    const item = await this.assertItemOwnership(id, userId);

    // Guard: root folder cannot be renamed or moved
    if (!item.parent && item.type === ItemType.FOLDER) {
      throw new BusinessException('Forbidden', HttpStatus.FORBIDDEN, 'The root folder cannot be modified');
    }

    if (dto.name !== undefined) {
      item.name = dto.name;
    }

    try {
      return await this.itemRepository.save(item);
    } catch (error) {
      throw new BusinessException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, (error as Error).message);
    }
  }

  async softDeleteFileSystemItem(id: string, userId: string): Promise<void> {
    const item = await this.assertItemOwnership(id, userId);

    // Guard: root folder must not be deleted
    if (!item.parent && item.type === ItemType.FOLDER) {
      throw new BusinessException('Forbidden', HttpStatus.FORBIDDEN, 'The root folder cannot be deleted');
    }
    //soft delete
    try {
      await this.itemRepository.softRemove(item);
    } catch (error) {
      throw new BusinessException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, (error as Error).message);
    }
  }

  async moveFileSystemItem(id: string, newParentId: string, userId: string): Promise<FileSystemItem> {
    // const user = this.userService.findRawUserById(userId);
    const item = await this.assertItemOwnership(id, userId);

    if (!item.parent && item.type === ItemType.FOLDER) {
      throw new BusinessException('Forbidden', HttpStatus.FORBIDDEN, 'The root folder cannot be moved');
    }

    if (newParentId === id) {
      throw new BusinessException('Invalid operation', HttpStatus.NOT_FOUND, 'An item cannot be moved into itself');
    }

    // Cycle guard: target must not be a descendant of the item being moved
    await this.assertNotAncestor(id, newParentId);

    const newParent = await this.itemRepository.findOne({
      where: { id: newParentId, owner: { id: userId } },
    });

    if (!newParent) {
      throw new BusinessException(
        'Parent not found',
        HttpStatus.NOT_FOUND,
        `Target folder with id ${newParentId} not found`,
      );
    }

    if (newParent.type !== ItemType.FOLDER) {
      throw new BusinessException('Invalid parent', HttpStatus.BAD_REQUEST, 'Move target must be a folder');
    }

    item.parent = newParent;

    try {
      return await this.itemRepository.save(item);
    } catch (error) {
      throw new BusinessException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, (error as Error).message);
    }
  }

  async copyFileSystemItem(id: string, newParentId: string | null, userId: string): Promise<FileSystemItem> {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException('User not found', HttpStatus.NOT_FOUND, `User with id ${userId} not found`);
    }

    const item = await this.assertItemOwnership(id, userId);

    let newParent: FileSystemItem | null = null;
    if (newParentId !== null) {
      if (newParentId === id) {
        throw new BusinessException(
          'Invalid operation',
          HttpStatus.BAD_REQUEST,
          'An item cannot be copied into itself',
        );
      }

      // Cycle guard for deep copies of folders
      if (item.type === ItemType.FOLDER) {
        await this.assertNotAncestor(id, newParentId);
      }

      newParent = await this.itemRepository.findOne({
        where: { id: newParentId, owner: { id: userId } },
      });

      if (!newParent) {
        throw new BusinessException(
          'Parent not found',
          HttpStatus.NOT_FOUND,
          `Target folder with id ${newParentId} not found`,
        );
      }

      if (newParent.type !== ItemType.FOLDER) {
        throw new BusinessException('Invalid parent', HttpStatus.BAD_REQUEST, 'Copy destination must be a folder');
      }
    }

    try {
      return await this.deepCopyItem(item, newParent, user);
    } catch (error) {
      if (error instanceof BusinessException) throw error;
      throw new BusinessException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR, (error as Error).message);
    }
  }

  async getSize(id: string, userId: string): Promise<number> {
    const item = await this.assertItemOwnership(id, userId);

    if (item.type === ItemType.FILE) {
      // Load metadata if not already present
      const withMeta = await this.itemRepository.findOne({
        where: { id },
        relations: ['metadata'],
      });
      return Number(withMeta?.metadata?.size ?? 0);
    }

    // For folders: sum sizes of all descendant files recursively
    const descendants = await this.itemRepository.findDescendants(item, {
      relations: ['metadata'],
    });

    return descendants.reduce((total, descendant) => {
      if (descendant.type === ItemType.FILE && descendant.metadata?.size) {
        return total + Number(descendant.metadata.size);
      }
      return total;
    }, 0);
  }
}
