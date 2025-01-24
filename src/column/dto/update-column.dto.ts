import { PartialType } from '@nestjs/mapped-types'; // 타입 가져오기
import { CreateColumnDto } from './create-column.dto'; // 생성 DTO 가져오기
import { IsNumber, IsNotEmpty } from 'class-validator'; // 데코레이터 가져오기

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
    @IsNumber()// 데코레이터 사용 ( 숫자 타입 )
    @IsNotEmpty({ message: '이동시킬 포지션을 입력해주세요.'}) // 데코레이터 사용 ( 비어있지 않은 숫자 타입 )
    columnPosition: number;
}
