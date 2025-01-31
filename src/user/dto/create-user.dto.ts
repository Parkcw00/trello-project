
import { User } from '../entities/user.entity';
import { IsNumber, IsString } from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  
   @IsString()
  name: string;

   @IsString()
  email: string;

   @IsString()
  password: string;

   @IsString()
  verifyPassword: string;
}