import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, length: 100 })
    name: string;

    @Column({ nullable: false,length:50 })
    password: string

    @Column({ nullable: false, unique: true })
    email: string;

    @Column({ nullable: false })
    role: 'Admin' | 'User';

    @Column({ nullable: false, default: true })
    isActive: boolean;


}