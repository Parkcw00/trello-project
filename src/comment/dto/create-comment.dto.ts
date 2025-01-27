import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기

import { Comment } from '../entities/comment.entity';
import { IsNumber, IsString } from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto extends PickType(Comment, [
  'content',
  'cardId',
  'memberId',
]) {
  @ApiProperty({ example: '오혜성 바보' })
  @IsString() // 데코레이터 사용 ( 문자열 타입 )
  content: string;

  @ApiProperty({ example: 1 })
  @IsNumber() // 데코레이터 사용 ( 숫자 타입 )
  memberId: number;
}
