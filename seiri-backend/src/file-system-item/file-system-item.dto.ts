import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReadUserDto } from '@/user/User.dto';
import { ItemType } from './file-system-item.entity';
import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { ReadFileDto } from '@/file/file.dto';

export class ReadItemDTO {
  @Expose()
  @IsString()
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
  parentId: string | undefined;
}

export class UpdateItemDTO extends PartialType(
  OmitType(ReadItemDTO, ['id', 'type', 'created_at', 'owner'] as const),
) {}
