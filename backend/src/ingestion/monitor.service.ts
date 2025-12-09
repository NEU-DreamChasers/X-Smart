/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class MonitorService {
    private readonly logger = new Logger(MonitorService.name);

    // Thời gian chờ giữa 2 lần cảnh báo (4 tiếng)
    private readonly COOLDOWN = 4 * 60 * 60 * 1000;
    private lastHeatAlertTime = 0;
    private lastAqiAlertTime = 0;

    constructor(
        private notificationsService: NotificationsService
    ) { }

    // 1. Check Nhiệt độ
    public checkHeatAlert(temp: number) {
        if (temp >= 37) {
            const now = Date.now();
            if (now - this.lastHeatAlertTime > this.COOLDOWN) {
                this.send('HEAT_WAVE', 'DANGER', `🔥 CẢNH BÁO: Nhiệt độ ${temp}°C. Nguy hiểm sức khỏe!`);
                this.lastHeatAlertTime = now;
            }
        }
    }

    // 2. Check Không khí
    public checkAqiAlert(aqi: number) {
        if (aqi >= 4) {
            const now = Date.now();
            if (now - this.lastAqiAlertTime > this.COOLDOWN) {
                this.send('AIR_POLLUTION', 'WARNING', `😷 CẢNH BÁO: AQI mức ${aqi}. Hãy đeo khẩu trang!`);
                this.lastAqiAlertTime = now;
            }
        }
    }

    private async send(type: string, level: string, message: string) {
        this.logger.warn(`>>> GỬI CẢNH BÁO: ${message}`);
        const title = level === 'DANGER' ? '🔥 CẢNH BÁO NGUY HIỂM' : '⚠️ CẢNH BÁO MÔI TRƯỜNG';
        const source = 'Hệ thống giám sát (Monitor)';

        try {
            await this.notificationsService.createGlobalAlert(
                title,
                message,
                type,
                source
            );
        } catch (error) {
            this.logger.error('Lỗi khi gửi cảnh báo sang Notification Service', error);
        }
    }
}