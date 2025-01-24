import { Delete } from '@nestjs/common';
// user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  verifyPassword: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  newPassword?: string;
  password?: string;
}

export class DeleteUserDto {  
  password: string;
}