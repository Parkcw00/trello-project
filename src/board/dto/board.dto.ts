import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BoardDto {
  @IsString()
  @IsNotEmpty({ message: '보드 이름을 입력해주세요' })
  @ApiProperty({ example: '보드 제목' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '보드 설명을 입력해주세요' })
  @ApiProperty({ example: '보드 설명' })
  content: string;

  @IsNumber()
  @IsNotEmpty({ message: '프로젝트 만료일을 입력해주세요' })
  @ApiProperty({ example: '보드 프로젝트 만료일' })
  expriyDate: Date;
}
