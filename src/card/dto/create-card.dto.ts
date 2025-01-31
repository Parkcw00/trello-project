import { PickType } from '@nestjs/mapped-types';
import { Card } from '../entities/card.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCardDto extends PickType(Card, [
  'title',
  'content',
  'cardPosition',
] as const) {
  @ApiProperty({ example: '1번 카드' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '1번 카드 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  cardPosition: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  memberId: number;
}
