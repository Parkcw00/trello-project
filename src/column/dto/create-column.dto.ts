import { PickType } from "@nestjs/mapped-types"; // 타입 가져오기

import { ColumnEntity } from "../entities/column.entity"; // 엔티티 가져오기
import { IsString } from "class-validator"; // 데코레이터 가져오기
import { ApiProperty } from "@nestjs/swagger";

export class CreateColumnDto extends PickType(ColumnEntity , [
  'columnType',
]) {  // 생성 DTO 클래스
    @ApiProperty({ example: 'todo' })
    @IsString() // 데코레이터 사용 ( 문자열 타입 )
    columnType: string; // 컬럼 타입

}
