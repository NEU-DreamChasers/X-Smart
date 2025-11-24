// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity'; // <-- Import file vừa tạo ở trên

@Module({
    imports: [TypeOrmModule.forFeature([User])], // <-- QUAN TRỌNG: Đăng ký Entity vào đây
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }