import { Controller, Get, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // 1. LOGIN ADMIN (User/Pass)
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  // 2. LOGIN GOOGLE (Bước 1: Chuyển hướng sang Google)
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) { }

  // 3. LOGIN GOOGLE (Bước 2: Google trả về)
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // SỬA: Không cần gọi validate nữa, req.user chính là user đã được validate
    const user = req.user;

    // Tạo Token
    const jwt = await this.authService.login(user);

    // Redirect về Frontend kèm Token
    return res.redirect(`http://localhost:3000/auth/success?token=${jwt.access_token}`);
  }
}