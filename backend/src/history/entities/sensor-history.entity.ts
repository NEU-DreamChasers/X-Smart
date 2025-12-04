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