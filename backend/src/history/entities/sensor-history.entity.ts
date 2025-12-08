/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('sensor_history')
@Index(['entityId', 'attributeName', 'observedAt']) 
export class SensorHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityId: string;

  @Column()
  attributeName: string;

  @Column('float')
  value: number;

  @CreateDateColumn()
  observedAt: Date;
}