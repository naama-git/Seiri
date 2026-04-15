import { Expose } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ReadUserDto } from '@/user/User.dto';
import { ItemType } from './file-system-item.entity';
import { PartialType, PickType } from '@nestjs/swagger';
import { ReadFileDto } from '@/file/file.dto';

export class ReadItemDTO {
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsEnum(ItemType)
  @IsNotEmpty()
  type!: ItemType;

  @Expose()
  @IsNotEmpty()
  owner!: ReadUserDto;

  @Expose()
  @IsNotEmpty()
  parent: ReadItemDTO | undefined;

  @Expose()
  children: ReadItemDTO[] = [];

  @Expose()
  ai_tags: any;

  @Expose()
  created_at!: Date;

  @Expose()
  metadata?: ReadFileDto;
}

export class CreateItemDto extends PickType(ReadItemDTO, [
  'name',
  'type',
] as const) {
  @IsUUID()
  parentId: string | undefined;
}

export class UpdateItemDTO extends PartialType(
  PickType(ReadItemDTO, ['name'] as const),
) {}

export class MoveItemDTO {
  @IsOptional()
  @IsUUID()
  newParentId: string | null = null;
}

export class CopyItemDTO {
  @IsOptional()
  @IsUUID()
  newParentId: string | null = null;
}
