import { PartialType } from '@nestjs/mapped-types'; // 타입 가져오기
import { CreateColumnDto } from './create-column.dto'; // 생성 DTO 가져오기
import { IsNumber, IsNotEmpty } from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
    // @IsNotEmpty()
    // id: number;

    // @IsNotEmpty()
    // targetColumnId: number;
}
