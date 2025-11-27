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

  // Hàm này tự chạy ngay khi Server khởi động
  async onModuleInit() {
    await this.seedAdminUser();
  }

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // Tự động tạo Admin
  private async seedAdminUser() {
    try {
      const adminExists = await this.findOne('admin');

      if (!adminExists) {
        console.log('⚡ Đang khởi tạo tài khoản Admin...');

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('admin123', salt);

        const admin = this.usersRepository.create({
          username: 'admin',
          passwordHash,
          role: 'admin',
        });

        await this.usersRepository.save(admin);
        console.log('ĐÃ TẠO ADMIN THÀNH CÔNG: User: "admin" / Pass: "admin123"');
      } else {
        console.log('Tài khoản Admin đã tồn tại.');
      }
    } catch (error) {
      console.error('LỖI KHỞI TẠO ADMIN:', error);
    }
  }
}
