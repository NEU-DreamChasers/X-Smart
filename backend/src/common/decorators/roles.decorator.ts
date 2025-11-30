import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/user.entity';

// Key này dùng để Guard đọc được metadata
export const ROLES_KEY = 'roles';

// Hàm tạo Decorator: @Roles(UserRole.ADMIN, UserRole.USER)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);