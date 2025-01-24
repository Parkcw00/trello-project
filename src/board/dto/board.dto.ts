import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BoardDto {
  @IsString()
  @IsNotEmpty({ message: '보드 이름을 입력해주세요' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '보드 설명을 입력해주세요' })
  content: string;

  @IsNumber()
  @IsNotEmpty({ message: '프로젝트 만료일을 입력해주세요' })
  expriyDate: Date;
}
