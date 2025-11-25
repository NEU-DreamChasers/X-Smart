// src/users/users.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 1. Hàm này tự chạy ngay khi Server khởi động
  async onModuleInit() {
    await this.seedAdminUser();
  }

  // 2. Hàm tìm user trong Database (AuthService sẽ gọi hàm này)
  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // 3. Logic tự động tạo Admin (Seed Data)
  private async seedAdminUser() {
    try {
      const adminExists = await this.findOne('admin');

      if (!adminExists) {
        console.log('⚡ Đang khởi tạo tài khoản Admin...');

        // Tạo mật khẩu hash
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('admin123', salt);

        // Tạo object user
        const admin = this.usersRepository.create({
          username: 'admin',
          passwordHash,
          role: 'admin',
        });

        // Lưu xuống Database
        await this.usersRepository.save(admin);
        console.log('ĐÃ TẠO ADMIN THÀNH CÔNG: User: "admin" / Pass: "admin123"');
      } else {
        console.log('Tài khoản Admin đã tồn tại.');
      }
    } catch (error) {
      // Dòng này sẽ giúp chúng ta thấy lỗi thật sự là gì (DB error, Bcrypt error,...)
      console.error('LỖI KHỞI TẠO ADMIN:', error);
    }
  }
}
