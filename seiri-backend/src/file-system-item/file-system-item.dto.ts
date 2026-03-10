import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, Length, MaxLength } from 'class-validator';
import { FileSystemItem } from './file-system-item.entity';
import { ReadUserDTO } from 'src/user/dto/User.dto';

export class CreateFileSystemItemDto {
    name:string;
    type: 'file' | 'folder';
}

export class ReadFileSystemItemDto extends OmitType(CreateFileSystemItemDto, []) {
    id:string;
    owner: ReadUserDTO;
    parent: ReadFileSystemItemDto | null;
    children: ReadFileSystemItemDto[] | null;
    ai_tags:any|null;
    created_at: Date;
    metadata: any; // This can be further defined based on the structure of FileMetadata
}

export class UpdatePlainFileSystemItemDto extends PartialType(CreateFileSystemItemDto) {}

export class UpdateItemLocationDto extends PartialType(CreateFileSystemItemDto) {
    parentId: string | null; // Allow moving to root by setting parentId to null
}
