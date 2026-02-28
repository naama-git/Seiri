import { User } from 'src/user/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, UpdateDateColumn } from 'typeorm';


export enum ItemType {
  FILE = 'file',
  FOLDER = 'folder',
}


@Entity('file_system_items')
@Tree('materialized-path')

export class FileSystemItem {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, type: 'enum', enum: ItemType,default: ItemType.FILE, })
  type: ItemType;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  ai_tags: any;

  @ManyToOne(() => User, (user) => user.items)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @TreeParent()
  @JoinColumn({ name: 'parent_id' })
  parent: FileSystemItem;

  @TreeChildren()
  children: FileSystemItem[];


  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn() 
  deleted_at: Date;


  

}