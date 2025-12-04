/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  adapterType: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ default: true })
  isActive: boolean;
}
