import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users') // Tên bảng trong DB
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;
}
