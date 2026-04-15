import { Injectable } from '@nestjs/common';
import { CreateItemDto, UpdateItemDTO } from './file-system-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileSystemItem, ItemType } from './file-system-item.entity';
import { IsNull, TreeRepository } from 'typeorm';
import { BusinessException } from '@/core/exception.model';
import { UserService } from '../user/user.service';
import { User } from '@/user/user.entity';

@Injectable()
export class FileSystemItemService {
  constructor(
    @InjectRepository(FileSystemItem)
    private readonly itemRepository: TreeRepository<FileSystemItem>,
    private readonly userService: UserService,
  ) {}

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async assertItemOwnership(
    id: string,
    userId: string,
  ): Promise<FileSystemItem> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['owner', 'metadata', 'parent'],
    });

    if (!item) {
      throw new BusinessException(
        'Item not found',
        404,
        `Item with id ${id} not found`,
        this.assertItemOwnership.name,
        this.constructor.name,
      );
    }

    if (item.owner.id !== userId) {
      throw new BusinessException(
        'Forbidden',
        403,
        `User ${userId} does not own item ${id}`,
        this.assertItemOwnership.name,
        this.constructor.name,
      );
    }

    return item;
  }

  /**
   * Guard against moving/copying an item into one of its own descendants,
   * which would create a cycle in the tree.
   */
  private async assertNotAncestor(
    itemId: string,
    targetParentId: string,
  ): Promise<void> {
    // Walk up the target's ancestors to see if itemId appears
    let current = await this.itemRepository.findOne({
      where: { id: targetParentId },
      relations: ['parent'],
    });

    while (current) {
      if (current.id === itemId) {
        throw new BusinessException(
          'Invalid operation',
          400,
          'Cannot move an item into one of its own descendants',
          this.assertNotAncestor.name,
          this.constructor.name,
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
      throw new BusinessException(
        'Item not found',
        404,
        `Item ${source.id} disappeared during copy`,
        this.deepCopyItem.name,
        this.constructor.name,
      );
    }

    const clone = this.itemRepository.create({
      name: newParent
        ? sourceWithChildren.name
        : `${sourceWithChildren.name} (copy)`,
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

  async createFileSystemItem(item: CreateItemDto, userId: string) {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException(
        'User not found',
        404,
        `User with id ${userId} was not found`,
        this.createFileSystemItem.name,
        this.constructor.name,
      );
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
          404,
          `Parent folder with id ${item.parentId} not found or not owned by user`,
          this.createFileSystemItem.name,
          this.constructor.name,
        );
      }

      if (parent.type !== ItemType.FOLDER) {
        throw new BusinessException(
          'Invalid parent',
          400,
          `Parent item ${item.parentId} is not a folder`,
          this.createFileSystemItem.name,
          this.constructor.name,
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
      return await this.itemRepository.save(newItem);
    } catch (error) {
      throw new BusinessException(
        'Internal server error',
        500,
        (error as Error).message,
        this.createFileSystemItem.name,
        this.constructor.name,
      );
    }
  }

  async getRootFolder(userId: string): Promise<FileSystemItem> {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException(
        'User not found',
        404,
        `User with id ${userId} not found`,
        this.getRootFolder.name,
        this.constructor.name,
      );
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
    return this.createFileSystemItem(
      {
        type: ItemType.FOLDER,
        name: `root-folder-${userId}`,
        parentId: undefined,
      },
      userId,
    );
  }

  async getItemById(
    id: string,
    userId: string,
  ): Promise<FileSystemItem | FileSystemItem[]> {
    const item = await this.itemRepository.findOne({
      where: { id, owner: { id: userId } },
      relations: ['metadata', 'owner'],
    });

    if (!item) {
      throw new BusinessException(
        'Item not found',
        404,
        `Item with id ${id} not found`,
        this.getItemById.name,
        this.constructor.name,
      );
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

  async updateFileSystemItem(
    id: string,
    dto: UpdateItemDTO,
    userId: string,
  ): Promise<FileSystemItem> {
    const item = await this.assertItemOwnership(id, userId);

    // Guard: root folder cannot be renamed or moved
    if (!item.parent && item.type === ItemType.FOLDER) {
      throw new BusinessException(
        'Forbidden',
        403,
        'The root folder cannot be modified',
        this.updateFileSystemItem.name,
        this.constructor.name,
      );
    }

    if (dto.name !== undefined) {
      item.name = dto.name;
    }

    try {
      return await this.itemRepository.save(item);
    } catch (error) {
      throw new BusinessException(
        'Internal server error',
        500,
        (error as Error).message,
        this.updateFileSystemItem.name,
        this.constructor.name,
      );
    }
  }

  async softDeleteFileSystemItem(id: string, userId: string): Promise<void> {
    const item = await this.assertItemOwnership(id, userId);

    // Guard: root folder must not be deleted
    if (!item.parent && item.type === ItemType.FOLDER) {
      throw new BusinessException(
        'Forbidden',
        403,
        'The root folder cannot be deleted',
        this.softDeleteFileSystemItem.name,
        this.constructor.name,
      );
    }
    //soft delete
    try {
      await this.itemRepository.softRemove(item);
    } catch (error) {
      throw new BusinessException(
        'Internal server error',
        500,
        (error as Error).message,
        this.softDeleteFileSystemItem.name,
        this.constructor.name,
      );
    }
  }

  async moveFileSystemItem(
    id: string,
    newParentId: string,
    userId: string,
  ): Promise<FileSystemItem> {
    const user = this.userService.findRawUserById(userId);
    const item = await this.assertItemOwnership(id, userId);

    if (!item.parent && item.type === ItemType.FOLDER) {
      throw new BusinessException(
        'Forbidden',
        403,
        'The root folder cannot be moved',
        this.moveFileSystemItem.name,
        this.constructor.name,
      );
    }

    if (newParentId === id) {
      throw new BusinessException(
        'Invalid operation',
        400,
        'An item cannot be moved into itself',
        this.moveFileSystemItem.name,
        this.constructor.name,
      );
    }

    // Cycle guard: target must not be a descendant of the item being moved
    await this.assertNotAncestor(id, newParentId);

    const newParent = await this.itemRepository.findOne({
      where: { id: newParentId, owner: { id: userId } },
    });

    if (!newParent) {
      throw new BusinessException(
        'Parent not found',
        404,
        `Target folder with id ${newParentId} not found`,
        this.moveFileSystemItem.name,
        this.constructor.name,
      );
    }

    if (newParent.type !== ItemType.FOLDER) {
      throw new BusinessException(
        'Invalid parent',
        400,
        'Move target must be a folder',
        this.moveFileSystemItem.name,
        this.constructor.name,
      );
    }

    item.parent = newParent;

    try {
      return await this.itemRepository.save(item);
    } catch (error) {
      throw new BusinessException(
        'Internal server error',
        500,
        (error as Error).message,
        this.moveFileSystemItem.name,
        this.constructor.name,
      );
    }
  }

  async copyFileSystemItem(
    id: string,
    newParentId: string | null,
    userId: string,
  ): Promise<FileSystemItem> {
    const user = await this.userService.findRawUserById(userId);
    if (!user) {
      throw new BusinessException(
        'User not found',
        404,
        `User with id ${userId} not found`,
        this.copyFileSystemItem.name,
        this.constructor.name,
      );
    }

    const item = await this.assertItemOwnership(id, userId);

    let newParent: FileSystemItem | null = null;
    if (newParentId !== null) {
      if (newParentId === id) {
        throw new BusinessException(
          'Invalid operation',
          400,
          'An item cannot be copied into itself',
          this.copyFileSystemItem.name,
          this.constructor.name,
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
          404,
          `Target folder with id ${newParentId} not found`,
          this.copyFileSystemItem.name,
          this.constructor.name,
        );
      }

      if (newParent.type !== ItemType.FOLDER) {
        throw new BusinessException(
          'Invalid parent',
          400,
          'Copy destination must be a folder',
          this.copyFileSystemItem.name,
          this.constructor.name,
        );
      }
    }

    try {
      return await this.deepCopyItem(item, newParent, user);
    } catch (error) {
      if (error instanceof BusinessException) throw error;
      throw new BusinessException(
        'Internal server error',
        500,
        (error as Error).message,
        this.copyFileSystemItem.name,
        this.constructor.name,
      );
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
