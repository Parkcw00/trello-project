import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'userId는 필수 입력값입니다.' }) // 빈 값이면 오류 발생
  @IsNumber({}, { message: 'userId는 숫자여야 합니다.' }) // 숫자 타입만 허용
  userId: number;
}
