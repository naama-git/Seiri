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

export enum Role {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  USER = 'user',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false, length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ nullable: false, length: 100, name: 'last_name' })
  lastName!: string;

  @Column({ nullable: false, length: 255, select: false })
  password!: string;

  @Column({ nullable: false, unique: true })
  email!: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role!: Role;

  @OneToOne(() => FileSystemItem, { cascade: true })
  @JoinColumn({ name: 'root_folder_id' })
  rootFolder!: FileSystemItem;

  @OneToMany(() => FileSystemItem, (item) => item.owner)
  items!: FileSystemItem[];

  @CreateDateColumn()
  created_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
