import { FileSystemItem } from '../file-system-item/file-system-item.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('fileMetadata')
export class FileMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @OneToOne(() => FileSystemItem, (item) => item.metadata)
  @JoinColumn({ name: 'item_id' })
  item: FileSystemItem;

  @Column({ nullable: false, type: 'bigint' })
  size: number;

  @Column({ nullable: false, name: 'MIME_type' })
  mimeType: string;

  @Column({ nullable: false })
  extension: string;

  @Column()
  s3_key: string;

  @Column({ type: 'jsonb', default: {} })
  ai_results: {
    tags?: string[];
    summary?: string;
    detected_language?: string;
    content_type?: string;
  };

  @Column({ default: false })
  is_processed: boolean;
}
