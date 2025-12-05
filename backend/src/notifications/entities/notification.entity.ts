/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  reportId: string;

  @Column()
  userId: number; 

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}