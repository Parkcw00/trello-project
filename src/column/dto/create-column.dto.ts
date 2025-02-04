import { PickType } from "@nestjs/mapped-types"; // 타입 가져오기

import { ColumnEntity } from "../entities/column.entity"; // 엔티티 가져오기
import {  IsNumber, IsString } from "class-validator"; // 데코레이터 가져오기
import { ApiProperty } from "@nestjs/swagger";

export class CreateColumnDto extends PickType(ColumnEntity , ['columnType' , 'boardId']) {  // 생성 DTO 클래스
    @ApiProperty({ example: 'todo' })
    @IsString() // 데코레이터 사용 ( 문자열 타입 )
    columnType: string; // 컬럼 타입

    @ApiProperty({ example: 2 })
    @IsNumber() // 데코레이터 사용 ( 숫자 타입 )
    boardId: number; // 보드아이디 : 보드 아이디를 숫자 타입으로 저장
}
