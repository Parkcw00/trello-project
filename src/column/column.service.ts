import _ from 'lodash'; // 배열, 객체, 문자열 등의 데이터를 쉽게 조작할 수 있도록 도와주는 라이브러리
import { Repository } from 'typeorm'; // 데이터베이스 조작을 도와주는 라이브러리
import { Injectable } from '@nestjs/common'; // 서비스 데코레이터
import { CreateColumnDto } from './dto/create-column.dto'; // 생성 DTO 가져오기
import { UpdateColumnDto } from './dto/update-column.dto'; // 업데이트 DTO 가져오기
import { ColumnEntity } from './entities/column.entity'; // 엔티티 가져오기
import { InjectRepository } from '@nestjs/typeorm'; // 리포지토리 의존성 주입

@Injectable() // 서비스에 리포지토리를 의존성 주입
export class ColumnService { // 서비스 클래스
  constructor( // 인스턴스를 생성할때 쓰이는 메서드
    @InjectRepository(ColumnEntity) // 리포지토리 의존성 주입
    private columnRepository: Repository<ColumnEntity> // 리포지토리 인스턴스 생성
  ) {} // 생성자 메서드
  create(createColumnDto: CreateColumnDto) { // 데이터 생성 메서드 
    return this.columnRepository.save(createColumnDto); // 리포지토리 인스턴스를 사용해서 데이터 저장
  }

  findAll() {
    return `This action returns all column`;
  }

  findOne(id: number) {
    return `This action returns a #${id} column`;
  }

  update(id: number, updateColumnDto: UpdateColumnDto) {
    return `This action updates a #${id} column`;
  }

  remove(id: number) {
    return `This action removes a #${id} column`;
  }
}
