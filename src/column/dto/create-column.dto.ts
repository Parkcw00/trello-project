import { PickType } from "@nestjs/mapped-types"; // 타입 가져오기

import { ColumnEntity } from "../entities/column.entity"; // 엔티티 가져오기
import {  IsNumber, IsOptional, IsString } from "class-validator"; // 데코레이터 가져오기

export class CreateColumnDto extends PickType(ColumnEntity , ['columnType' , 'boardId', 'columnPosition']) {  
    @IsString() // 데코레이터 사용 ( 문자열 타입 )
    columnType: string;

    @IsNumber() // 데코레이터 사용 ( 숫자 타입 )
    boardId: number;

    @IsOptional() // 데코레이터 사용 ( 숫자 타입 )
    @IsNumber() // 데코레이터 사용 ( 숫자 타입 )
    columnPosition?: number;
}
