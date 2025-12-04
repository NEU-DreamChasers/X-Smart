/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from 'src/users/user.entity'; // Kiểm tra đúng đường dẫn file User của bạn
import type { Point } from 'geojson';

export enum ReportStatus {
    PENDING = 'PENDING',   // Chờ duyệt
    APPROVED = 'APPROVED', // Đã duyệt
    REJECTED = 'REJECTED', // Từ chối
    RESOLVED = 'RESOLVED', // Đã xử lý xong
}

@Entity('reports')
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    imageUrl: string;

    // --- VỊ TRÍ BẢN ĐỒ (PostGIS) ---
    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
    })
    location: Point;

    // --- TRẠNG THÁI ---
    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.PENDING,
    })
    status: ReportStatus;

    // --- NGƯỜI GỬI ---
    @Column({ nullable: true })
    userId: number;

    @ManyToOne(() => User, (user) => user.reports, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Thông tin cho khách vãng lai
    @Column({ nullable: true })
    guestName: string;

    @Column({ nullable: true })
    guestPhone: string;

    @CreateDateColumn()
    createdAt: Date;
}