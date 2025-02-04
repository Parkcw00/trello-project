import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기
import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'; // 데코레이터 가져오기

export class CreateUserDto extends PickType(User, [
  'email',
  'name',
  'password',
]) {
  @ApiProperty({ example: '청게 장조림' })
  @IsNotEmpty({ message: '이름을 입력해주세요' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'email1234@gmail.com' })
  @IsNotEmpty({ message: 'email을 입력해주세요' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'pw1234' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @IsString()
  @Length(1, 8, { message: '비밀번호는 1자 이상 8자 이하로 입력해주세요' })
  password: string;

  @ApiProperty({ example: 'pw1234' })
  @IsNotEmpty({ message: '비밀번호를 확인해주세요' })
  @IsString()
  @Length(1, 30, { message: '비밀번호는 1자 이상 30자 이하로 입력해주세요' })
  verifyPassword: string;
}
