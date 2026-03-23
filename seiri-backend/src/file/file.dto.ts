import { ReadFileSystemItemDto } from 'src/file-system-item/file-system-item.dto';

export class ReadFileDto {
  id: string;
  item: ReadFileSystemItemDto;
  size: number;
  mimeType: string;
  extension: string;
  s3_key: string;
  ai_results: {
    tags?: string[];
    summary?: string;
  };
  is_processed: boolean;
}

export class ReadFileMetadataDtoForItem {
  id: string;
  size: number;
  mimeType: string;
  extension: string;
  s3_key: string;
  ai_results: {
    tags?: string[];
    summary?: string;
  };
  is_processed: boolean;
}
