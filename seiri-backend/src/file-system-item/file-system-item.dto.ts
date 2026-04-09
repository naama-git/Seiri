import { Expose } from 'class-transformer';
import { IsEnum, IsString, MaxLength } from 'class-validator';
import { ReadUserDto } from 'src/user/User.dto';
import { ItemType } from './file-system-item.entity';
import { PartialType, PickType } from '@nestjs/swagger';

export class ReadItemDTO {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEnum(ItemType)
  type: ItemType;

  @Expose()
  owner: ReadUserDto;

  @Expose()
  parent: ReadItemDTO | null;

  @Expose()
  children: ReadItemDTO[] | null;

  @Expose()
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ai_tags: any | null;

  @Expose()
  created_at: Date;

  @Expose()
  metadata: any;
}

export class CreateFileSystemItemDto extends PickType(ReadItemDTO, [
  'name',
  'type',
] as const) {}

export class UpdateItemDTO extends PartialType(
  PickType(ReadItemDTO, ['id', 'type', 'created_at', 'owner'] as const),
) {}
