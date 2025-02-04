import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기
import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'; // 데코레이터 가져오기
export class UpdateUserDto extends PickType(User, ['name', 'password']) {
  @ApiProperty({ example: '청게 장조림' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'pw1234' })
  @IsString()
  newPassword: string;

  @ApiProperty({ example: 'pw1234' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  @IsString()
  password: string;
}
