// import _ from 'lodash'; // 배열, 객체, 문자열 등의 데이터를 쉽게 조작할 수 있도록 도와주는 라이브러리
// import { Repository } from 'typeorm'; // 데이터베이스 조작을 도와주는 라이브러리
// import { Injectable } from '@nestjs/common'; // 서비스 데코레이터
// import { UpdateColumnDto } from '../column/dto/update-column.dto'; // 업데이트 DTO 가져오기
// import { ColumnEntity } from '../column/entities/column.entity'; // 엔티티 가져오기
// import { InjectRepository } from '@nestjs/typeorm'; // 리포지토리 의존성 주입

// @Injectable() // 서비스에 리포지토리를 의존성 주입
// export class swapPositionService { // 서비스 클래스
//   constructor( // 인스턴스를 생성할때 쓰이는 메서드
//     @InjectRepository(ColumnEntity) // 리포지토리 의존성 주입
//     private columnRepository: Repository<ColumnEntity> // 리포지토리 인스턴스 생성
//   ) {} // 생성자 메서드

//   const nowColumn = column.find((column) => column.id === UpdateColumnDto.id);
//     console.log(`33333333333333333`,nowColumn);

//     // const middleColumn = column.find((column) => column.id === 

//     const newColumn = column.find((column) => column.id === UpdateColumnDto.targetColumnId);
//     console.log(`44444444444444444`,newColumn);
//     console.log(`123123123`, nowColumn.columnPosition, newColumn.columnPosition);

//     const iii = column.find((column) => newColumn.columnPosition > nowColumn.columnPosition)
// console.log(`------>`,iii);
//     const newPosition = (nowColumn.columnPosition + newColumn.columnPosition) / 2;
//     console.log(`55555555555555555`,newPosition);
// }