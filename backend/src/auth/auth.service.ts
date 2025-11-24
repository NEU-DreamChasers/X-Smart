import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // 1. Hàm xác thực: Kiểm tra username và password có khớp không
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            // Tách password ra, chỉ trả về thông tin an toàn
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    // 2. Hàm đăng nhập: Tạo ra Token trả về cho người dùng
    async login(user: any) {
        const payload = { username: user.username, sub: user.userId, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}