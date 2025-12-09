/* src/ingestion/monitor.controller.ts */
import { Controller, Get } from '@nestjs/common';
import { MonitorService } from './monitor.service';

@Controller('monitor')
export class MonitorController {
    constructor(private readonly monitorService: MonitorService) { }

    @Get('test')
    triggerTestAlert() {
        // Giả lập nhiệt độ 40 độ (vượt ngưỡng 37) để kích hoạt cảnh báo
        this.monitorService.checkHeatAlert(40);

        return 'Đã gửi tín hiệu test nhiệt độ 40°C. Hãy kiểm tra DB và Socket!';
    }
}