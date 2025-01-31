import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

/**
 * 멤버 추가 요청 시 사용되는 DTO
 * - 특정 보드에 새로운 멤버를 추가할 때 사용됨
 */
export class CreateMemberDto {
  @ApiProperty({
    example: 1,
    description: '추가할 사용자의 ID (숫자만 입력 가능)',
  })
  @IsNotEmpty({ message: 'userId는 필수 입력값입니다.' }) // 필수 값 검사
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'userId는 숫자여야 합니다.' },
  ) // NaN 또는 Infinity 값 방지
  userId: number;
}
