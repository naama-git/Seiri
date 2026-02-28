import { FileSystemItem } from 'src/file-system-item/file-system-item.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: false, length: 100 })
  name: string;

  @Column({ nullable: false, length: 50 })
  password: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  role: 'Admin' | 'User';

  @Column({ nullable: false, default: true })
  isActive: boolean;

  
  @OneToOne(() => FileSystemItem)
  @JoinColumn({ name: 'root_folder_id' })
  rootFolder: FileSystemItem;

  @OneToMany(() => FileSystemItem, (item) => item.owner)
  items: FileSystemItem[];


  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
   updated_at: Date;
  
  @DeleteDateColumn() 
  deleted_at: Date;

 
  
}
