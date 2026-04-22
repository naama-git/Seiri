import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FileSystemItemService } from './file-system-item.service';
import { CopyItemDTO, CreateItemDto, MoveItemDTO, ReadItemDTO, UpdateItemDTO } from './file-system-item.dto';
import { serialize } from '../core/mapper.interceptor';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { currentUser } from '@/auth/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/auth.interface';

@ApiTags('file-system-items')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('file-system-item')
export class FileSystemItemController {
  constructor(private readonly itemService: FileSystemItemService) {}

  @serialize(ReadItemDTO)
  @ApiOperation({ summary: 'Get the root folder of the authenticated user' })
  @Get('root')
  async getRootFolder(@currentUser() user: AuthenticatedUser) {
    return this.itemService.getRootFolder(user.userId);
  }

  @serialize(ReadItemDTO)
  @ApiOperation({
    summary: 'Get an item by ID (returns children array if folder)',
  })
  @ApiParam({ name: 'id', description: 'FileSystemItem UUID' })
  @Get(':id')
  async getItemById(@Param('id') id: string, @currentUser() user: AuthenticatedUser) {
    return this.itemService.getItemById(id, user.userId);
  }

  @ApiOperation({
    summary: 'Get the total size of an item (recursive for folders)',
  })
  @ApiParam({ name: 'id', description: 'FileSystemItem UUID' })
  @Get(':id/size')
  async getSize(@Param('id') id: string, @currentUser() user: AuthenticatedUser): Promise<{ size: number }> {
    const size = await this.itemService.getSize(id, user.userId);
    return { size };
  }

  @serialize(ReadItemDTO)
  @ApiOperation({ summary: 'Create new item' })
  @Post()
  async createItem(@Body() dto: CreateItemDto, @currentUser() user: AuthenticatedUser) {
    return await this.itemService.createFileSystemItem(dto, user.userId);
  }

  @serialize(ReadItemDTO)
  @ApiOperation({ summary: 'Update an item (rename)' })
  @ApiParam({ name: 'id', description: 'FileSystemItem UUID' })
  @Patch(':id')
  async updateItem(@Param('id') id: string, @Body() dto: UpdateItemDTO, @currentUser() user: AuthenticatedUser) {
    return this.itemService.updateFileSystemItem(id, dto, user.userId);
  }

  @serialize(ReadItemDTO)
  @ApiOperation({ summary: 'Move an item to a new parent folder' })
  @ApiParam({ name: 'id', description: 'FileSystemItem UUID' })
  @Patch(':id/move')
  async moveItem(@Param('id') id: string, @Body() dto: MoveItemDTO, @currentUser() user: AuthenticatedUser) {
    return this.itemService.moveFileSystemItem(id, dto.newParentId, user.userId);
  }

  @serialize(ReadItemDTO)
  @ApiOperation({
    summary: 'Copy an item (deep copy if folder) to a new parent',
  })
  @ApiParam({ name: 'id', description: 'FileSystemItem UUID' })
  @Post(':id/copy')
  async copyItem(@Param('id') id: string, @Body() dto: CopyItemDTO, @currentUser() user: AuthenticatedUser) {
    return this.itemService.copyFileSystemItem(id, dto.newParentId, user.userId);
  }
}
