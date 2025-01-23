import { IsString , IsNumber} from "class-validator" // 여기서 데코레이터 사용할 거 가져오기

import { Column , Entity , PrimaryGeneratedColumn } from "typeorm" // 여기서 데코레이터 사용할 거 가져오기

@Entity({ // 엔티티 데코레이터 사용
    name: 'column' // 테이블 이름 지정
})
export class ColumnEntity {
    @PrimaryGeneratedColumn() // 기본키 생성
    id: number; // 타입 지정 ( 숫자 타입 )

    @IsString() // 문자열 타입의 데코레이터가 맞는지 확인
    @Column() // 컬럼 데코레이터 사용
    columnType: string; // 타입 지정 ( 문자열 타입 )

    @IsNumber() // 숫자 타입의 데코레이터가 맞는지 확인
    @Column() // 컬럼 데코레이터 사용
    boardId: number; // 타입 지정 ( 숫자 타입 )

    @IsNumber() // 숫자 타입의 데코레이터가 맞는지 확인
    columnPosition: number; // 타입 지정 ( 숫자 타입 )

}
