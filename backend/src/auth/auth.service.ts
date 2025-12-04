/*
X-Smart
Copyright (c) 2025 NEU-DreamChasers

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  // 1. LOGIC CHO ADMIN (Đăng nhập Username/Pass)
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    // Nếu user tồn tại & có pass & pass đúng
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      if (user.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Công dân vui lòng đăng nhập bằng Google!');
      }
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. LOGIC CHO DÂN (Đăng nhập Google)
  async validateGoogleUser(profile: any) {
    const { email, firstName, lastName, picture } = profile;
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      try {
        user = await this.usersService.create({
          email: email,
          username: email.split('@')[0],
          fullName: `${firstName} ${lastName}`.trim(),
          passwordHash: null,
          provider: 'google',
          role: UserRole.USER,
          avatar: picture,
        });
      } catch (error) {
        throw error;
      }
    } else {
      console.log('User cũ đã quay lại:', user.email);
    }

    return user;
  }

  // 3. CẤP VÉ (Tạo JWT Token)
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar
      }
    };
  }
}