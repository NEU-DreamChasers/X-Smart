// src/users/users.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // Hàm này tự chạy ngay khi Server khởi động
  async onModuleInit() {
    await this.seedAdminUser();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  // 2. Hàm tìm user bằng Email (Dùng cho Google Login)
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email: email }
    });

    return user;
  }

  // 3. Hàm tạo User mới (Dùng khi Dân đăng ký lần đầu qua Google)
  async create(userDetails: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userDetails);
    return this.usersRepository.save(newUser);
  }

  // Tự động tạo Admin
  private async seedAdminUser() {
    try {
      const adminExists = await this.findByUsername('admin');

      if (!adminExists) {
        console.log('Đang khởi tạo tài khoản Admin...');

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('admin123', salt);

        const admin = this.usersRepository.create({
          username: 'admin',
          email: 'admin@x-smart.system',
          passwordHash,
          role: UserRole.ADMIN,
          provider: 'local',
        });

        await this.usersRepository.save(admin);
        console.log('ĐÃ TẠO ADMIN THÀNH CÔNG: User: "admin" / Pass: "admin123"');
      } else {
        console.log('Tài khoản Admin đã tồn tại.');
      }
    } catch (error) {
      console.error(' LỖI KHỞI TẠO ADMIN:', error);
    }
  }
}