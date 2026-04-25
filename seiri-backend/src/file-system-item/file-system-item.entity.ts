import { FileMetadata } from '../file/file.entity';
import { User } from '../user/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';

export enum ItemType {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FILE = 'file',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  FOLDER = 'folder',
}

@Entity('file_system_items')
@Tree('materialized-path')
export class FileSystemItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, length: 255 })
  name!: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: ItemType,
    default: ItemType.FILE,
  })
  type!: ItemType;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  ai_tags: any;

  @ManyToOne(() => User, (user) => user.items, { nullable: false })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @TreeParent({ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent?: FileSystemItem | null;

  @TreeChildren()
  children!: FileSystemItem[];

  @OneToOne(() => FileMetadata, (metadata) => metadata.item, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  metadata?: FileMetadata | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date | null;
}
