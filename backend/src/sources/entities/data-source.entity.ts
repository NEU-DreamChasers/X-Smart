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
