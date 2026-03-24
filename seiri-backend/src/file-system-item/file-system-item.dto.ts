import { OmitType, PartialType } from '@nestjs/swagger';
import { ReadUserDto } from 'src/user/User.dto';

export class CreateFileSystemItemDto {
  name: string;
  type: 'file' | 'folder';
}

export class ReadFileSystemItemDto extends OmitType(
  CreateFileSystemItemDto,
  [],
) {
  id: string;
  owner: ReadUserDto;
  parent: ReadFileSystemItemDto | null;
  children: ReadFileSystemItemDto[] | null;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ai_tags: any | null;
  created_at: Date;
  metadata: any;
}

export class UpdatePlainFileSystemItemDto extends PartialType(
  CreateFileSystemItemDto,
) {}

export class UpdateItemLocationDto extends PartialType(
  CreateFileSystemItemDto,
) {
  parentId: string | null;
}
