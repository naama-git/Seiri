import { PickType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';
import { ReadItemDTO } from 'src/file-system-item/file-system-item.dto';

export class ReadFileDto {
  @Expose()
  @IsUUID()
  id!: string;

  @Expose()
  item!: ReadItemDTO;

  @Expose()
  @IsNumber()
  size!: number;

  @Expose()
  @IsString()
  mimeType!: string;

  @Expose()
  @IsString()
  extension!: string;

  @Expose()
  @IsString()
  s3_key: string | undefined;

  @Expose()
  ai_results:
    | {
        tags?: string[];
        summary?: string;
      }
    | undefined;

  @Expose()
  @IsBoolean()
  is_processed: boolean | undefined;
}

export class CraeteFileDto extends PickType(ReadFileDto, ['mimeType', 'size', 'extension']) {}
