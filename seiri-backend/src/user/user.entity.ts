import { FileSystemItem } from '../file-system-item/file-system-item.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: false, length: 100 })
  name: string;

  @Column({ nullable: false, length: 50, select: false })
  password: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  role: 'Admin' | 'User';

  @OneToOne(() => FileSystemItem, { cascade: true })
  @JoinColumn({ name: 'root_folder_id' })
  rootFolder: FileSystemItem;

  @OneToMany(() => FileSystemItem, (item) => item.owner)
  items: FileSystemItem[];

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
