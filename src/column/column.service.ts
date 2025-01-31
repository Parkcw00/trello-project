import _ from 'lodash'; // 배열, 객체, 문자열 등의 데이터를 쉽게 조작할 수 있도록 도와주는 라이브러리
import { Repository } from 'typeorm'; // 데이터베이스 조작을 도와주는 라이브러리
import { Injectable, NotFoundException } from '@nestjs/common'; // 서비스 데코레이터
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
  
  async getMaxColumnPosition(boardId: number): Promise<number> {// 컬럼 최대 위치 조회 메서드
    const maxPosition = await this.columnRepository // 컬럼 리포지토리를 사용해서 쿼리 빌더를 생성
    // 여기서 쿼리 빌더란? 데이터베이트안에 있는 쿼리를 sql 쿼리를 직접 작성하지 않고도 쿼리를 작성할 수 있도록 도와주는 기능
      .createQueryBuilder('column') // 컬럼 엔티티를 쿼리 빌더에 적용
      .select('MAX(column.columnPosition)', 'max') // 컬럼 위치를 최대값으로 조회
      .where('column.boardId = :boardId', { boardId }) // 보드 아이디를 조건으로 조회
      .getRawOne(); // 쿼리 빌더를 사용해서 쿼리 실행
    return maxPosition.max ? Number(maxPosition.max) + 1 : 1; // 포지션에서 가장 높은 숫자가 있으면 그 숫자에 1을 더한값을 반환 하고 아니면 그냥 1을 반환
  }

  async create(createColumnDto: CreateColumnDto) { // 데이터 생성 메서드 
    const newPosition = await this.getMaxColumnPosition(createColumnDto.boardId); // 컬럼 최대 위치 조회 메서드를 이용해 새로운 위치 조회
    const columnData = { ...createColumnDto, columnPosition: Number(newPosition) }; // 생성 DTO 와 새로운 위치를 합쳐 컬럼 데이터를 생성
    return this.columnRepository.save(columnData); // 새롭게 생성된 컬럼 데이터를 리포지토리 인스턴스를 이용해서 저장
  }

    async findAll(): Promise<ColumnEntity[]> { // 모든 컬럼 조회 메서드
      return await this.columnRepository.find(); // 리포지토리 인스턴스를 사용해서 모든 컬럼 데이터를 조회
    }

  async findOne(id: number): Promise<ColumnEntity> { // 특정한 컬럼 조회 메서드
    const column = await this.columnRepository.findOne({ where: { id } }); // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 조회
    
    if(!column) { // 컬럼이 존재하지 않은 경우 오류 발생.
      throw new NotFoundException('컬럼이 존재하지 않습니다.');
    }

    return column; // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 조회

    
  }

  async update(id: number, updateColumnDto: UpdateColumnDto): Promise<string> { // 컬럼 업데이트 메서드
    const column = await this.columnRepository.findOne({ where: { id } }); // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 조회

    if (!column) {
        throw new NotFoundException('컬럼이 존재하지 않습니다.'); // 컬럼이 존재하지 않을 경우 오류 발생
    }

    // 업데이트 DTO 에서 컬럼포지션 속성을 추출하여 뉴포지션 이라는 새로운 변수에 할당함.(구조분해할당)
    const { columnPosition: newPosition } = updateColumnDto; 
    const nowCurrentPosition = column.columnPosition; // 현재 컬럼 포지션을 현재포지션 이라는 새로운 변수에 할당함.(구조분해할당)

    if (newPosition !== nowCurrentPosition) {
        // 이동 방향에 따라 다른 컬럼들의 위치를 조정
        if (newPosition > nowCurrentPosition) {
            // 현재 위치보다 큰 위치의 컬럼들을 하나씩 앞으로 이동
            await this.columnRepository // 리포지토리 인스턴스를 사용해서 쿼리 빌더를 생성
                .createQueryBuilder() // 쿼리 빌더를 사용해서 쿼리를 작성
                .update(ColumnEntity) // 컬럼 엔티티를 업데이트
                .where("columnPosition > :nowCurrentPosition AND columnPosition <= :newPosition", { nowCurrentPosition, newPosition }) // 현재 위치보다 크고 새로운 위치보다 작거나 같은 컬럼들을 조회
                .set({ columnPosition: () => "columnPosition - 1" }) // 컬럼 포지션을 앞으로 이동
                .execute(); // 쿼리빌더를 사용해서 쿼리 실행
        } else {
            // 현재 위치보다 작은 위치의 컬럼들을 하나씩 뒤로 이동
            await this.columnRepository // 리포지토리 인스턴스를 사용해서 쿼리 빌더를 생성
                .createQueryBuilder() // 쿼리 빌더를 사용해서 쿼리를 작성
                .update(ColumnEntity) // 컬럼 엔티티를 업데이트
                .where("columnPosition < :nowCurrentPosition AND columnPosition >= :newPosition", { nowCurrentPosition, newPosition }) // 현재 위치보다 작고 새로운 위치보다 크거나 같은 컬럼들을 조회
                .set({ columnPosition: () => "columnPosition + 1" }) // 컬럼 포지션을 뒤로 이동
                .execute(); // 쿼리빌더를 사용해서 쿼리 실행11
        }
    }
    // 변경된 컬럼의 위치 업데이트
    column.columnPosition = newPosition; // 컬럼 포지션을 새로운 포지션으로 업데이트
    await this.columnRepository.save(column); // 리포지토리 인스턴스를 사용해서 컬럼 데이터를 저장

    return column + `선택한 ${id} 컬럼이 ${newPosition} 위치로 이동 되었습니다.`; // 업데이트된 컬럼 데이터를 반환
  }

  async delete(id: number): Promise<string> {
    const column = await this.columnRepository.findOne({ where: { id } }); // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 조회
    if (!column) {
        throw new NotFoundException('컬럼이 존재하지 않습니다.'); // 컬럼이 존재하지 않을 경우 오류 발생
    }
    await this.columnRepository.delete(id); // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 삭제
    return `선택한 ${id} 컬럼이 삭제 되었습니다.`;
  }
}
