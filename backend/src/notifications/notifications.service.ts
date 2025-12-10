/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
    private gateway: NotificationsGateway,
  ) { }

  async createGlobalAlert(title: string, message: string, type: string, source: string) {
    try {
      // B1: Lưu vào DB (Để người dùng F5 vẫn thấy)
      // Lưu ý: userId = null nghĩa là thông báo chung cho tất cả mọi người
      const noti = this.repo.create({
        title,
        message,
        type,
        source,
        userId: null,
        isRead: false
      });
      const savedNoti = await this.repo.save(noti);

      // B2: Bắn Socket ngay lập tức (Để hiện Toast đỏ trên màn hình)
      this.gateway.sendGlobalAlert({
        id: savedNoti.id,
        title,
        message,
        type,
        source,
        timestamp: savedNoti.createdAt,
      });

      this.logger.log(`📢 Đã phát cảnh báo toàn cục: ${title}`);
      return savedNoti;
    } catch (error) {
      this.logger.error('Lỗi khi tạo cảnh báo global', error);
    }
  }

  async create(userId: number, title: string, message: string, reportId?: string) {
    const noti = this.repo.create({ userId, title, message, reportId });
    return this.repo.save(noti);
  }

  async findAllByUser(userId: number) {
    return this.repo.find({
      where: [{ userId: userId }, { userId: IsNull() }],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async markAsRead(id: string) {
    return this.repo.update(id, { isRead: true });
  }
}