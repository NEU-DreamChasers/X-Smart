import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiBody, ApiOperation, ApiTags, ApiProperty } from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Tên đăng nhập' })
  username: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu' })
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // API: POST /auth/login
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống (Lấy Access Token)' })
  @ApiBody({ type: LoginDto })
  async login(@Request() req, @Body() loginData: LoginDto) {
    return this.authService.login(req.user);
  }
}
