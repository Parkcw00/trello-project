import _ from 'lodash'; // 배열, 객체, 문자열 등의 데이터를 쉽게 조작할 수 있도록 도와주는 라이브러리
import { Repository } from 'typeorm'; // 데이터베이스 조작을 도와주는 라이브러리
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'; // 서비스 데코레이터
import { CreateColumnDto } from './dto/create-column.dto'; // 생성 DTO 가져오기
import { ColumnEntity } from './entities/column.entity'; // 엔티티 가져오기
import { InjectRepository } from '@nestjs/typeorm'; // 리포지토리 의존성 주입
import { LexoRank } from 'lexorank';
import { Member } from 'src/member/entities/member.entity';

@Injectable() // 서비스에 리포지토리를 의존성 주입
export class ColumnService {
  // 서비스 클래스
  constructor(
    // 인스턴스를 생성할때 쓰이는 메서드
    @InjectRepository(ColumnEntity)
    private columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Member) private memberRepository: Repository<Member>, // 리포지토리 인스턴스 생성
  ) {} // 생성자 메서드

  async create(
    userId: number,
    boardId: number,
    createColumnDto: CreateColumnDto,
  ): Promise<ColumnEntity> {
    // 데이터 생성 메서드


    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId:boardId },
    });
    if (!checkMember) {
      throw new NotFoundException(
        '컬럼을 만들수 있는 권한이 존재하지 않습니다.',
      );
    }

    let lexoRank: LexoRank;
    const existingColumn = await this.columnRepository.findOne({
      where: {},
      order: { lexo: 'DESC' },
    });
    if (existingColumn && existingColumn.lexo) {
      lexoRank = LexoRank.parse(existingColumn.lexo.toString()).genNext();
    } else {
      lexoRank = LexoRank.middle();
    }
    const newColumn: ColumnEntity = this.columnRepository.create({
      columnType: createColumnDto.columnType,
      boardId: boardId,
      lexo: lexoRank.toString(),
      memberId: checkMember.id,

    });

    const savedColumn = await this.columnRepository.save(newColumn);
    return savedColumn;
  }

  async findAll(boardId: number, userId: number): Promise<ColumnEntity[]> {
    // 모든 컬럼 조회 메서드

    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: boardId },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '컬럼을 조회 할 수 있는 권한이 존재하지 않습니다.',
      );
    }

    return await this.columnRepository.find({
      where: {
        boardId: boardId,
      },
    }); // 리포지토리 인스턴스를 사용해서 모든 컬럼 데이터를 조회
  }

  async findOne(
    columnId: number,
    userId: number,
    boardId: number,
  ): Promise<ColumnEntity> {
    // 특정한 컬럼 조회 메서드

    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: boardId },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '컬럼을 조회 할 수 있는 권한이 존재하지 않습니다.',
      );
    }

    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    }); // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 조회

    if (!column) {
      // 컬럼이 존재하지 않은 경우 오류 발생.
      throw new NotFoundException('컬럼이 존재하지 않습니다.');
    }

    return column; // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 조회
  }

  async updateColumnOrder(
    boardId: number,
    columnId: number,
    targetColumnId: number,
    userId: number,
  ): Promise<ColumnEntity> {
    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: boardId },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '컬럼을 순서를 변경 할 수 있는 권한이 존재하지 않습니다.',
      );
    }

    const columns = await this.columnRepository.find({
      where: { boardId },
      order: { lexo: 'DESC' },
    });

    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    const targetColumn = await this.columnRepository.findOne({
      where: { id: targetColumnId },
    });

    const columnIndex = columns.findIndex((column) => column.id === columnId);
    const targetColumnIndex = columns.findIndex(
      (column) => column.id === targetColumnId,
    );

    //-------------------------------------------------------------

    if (targetColumnIndex < columnIndex) {
      const targetNextColumnIndex = targetColumnIndex - 1;

      if (!column || !targetColumn) {
        throw new BadRequestException('컬럼이 존재하지 않습니다.');
      }

      const currentRank = LexoRank.parse(column.lexo);
      console.log(`--------------------> 현재 컬럼 랭크`, currentRank);
      const targetRank = LexoRank.parse(targetColumn.lexo);
      const targetNextColumn = columns[targetNextColumnIndex];

      if (targetNextColumnIndex < 0) {
        let lexoRank: LexoRank;
        lexoRank = LexoRank.parse(targetColumn.lexo.toString()).genNext(); // 현재 컬럼 다음 랭크

        await this.columnRepository.update(
          { id: columnId, boardId },
          { lexo: lexoRank.toString() },
        );

        return await this.columnRepository.findOne({ where: { id: columnId } });
      }
      const newRank = LexoRank.parse(targetNextColumn.lexo).between(targetRank); // 현재 컬럼와 타켓 컬럼 사이의 랭크

      await this.columnRepository.update(
        { id: columnId, boardId },
        { lexo: newRank.toString() },
      );

      return await this.columnRepository.findOne({ where: { id: columnId } });
    } else {
      const maxIndex: number = columns.length - 1;

      if (targetColumnIndex === maxIndex) {
        let lexoRank: LexoRank;
        lexoRank = LexoRank.parse(targetColumn.lexo.toString()).genPrev(); // 현재 컬럼 다음 랭크

        await this.columnRepository.update(
          { id: columnId, boardId },
          { lexo: lexoRank.toString() },
        );

        return await this.columnRepository.findOne({ where: { id: columnId } });
      }

      const targetNextColumnIndex = targetColumnIndex + 1;

      // const existingCard = await this.cardRepository.findOne({ where: { id: targetCardId }, order: { lexo: "DESC" } })

      if (!column || !targetColumn) {
        throw new BadRequestException('컬럼이 존재하지 않습니다.');
      }

      const currentRank = LexoRank.parse(column.lexo);
      console.log(`--------------------> 현재 컬럼 랭크`, currentRank);
      const targetRank = LexoRank.parse(targetColumn.lexo);
      const targetNextColumn = columns[targetNextColumnIndex];

      if (targetNextColumnIndex === maxIndex) {
        let lexoRank: LexoRank;
        lexoRank = LexoRank.parse(targetColumn.lexo.toString()).genPrev(); // 현재 컬럼 다음 랭크

        await this.columnRepository.update(
          { id: columnId, boardId },
          { lexo: lexoRank.toString() },
        );

        return await this.columnRepository.findOne({ where: { id: columnId } });
      }
      console.log('----------------------------');
      const newRank = LexoRank.parse(targetNextColumn.lexo).between(targetRank); // 현재 컬럼와 타켓 컬럼 사이의 랭크

      await this.columnRepository.update(
        { id: columnId, boardId },
        { lexo: newRank.toString() },
      );

      return await this.columnRepository.findOne({ where: { id: columnId } });
    }
    // 카드의 순서 업데이트
  }

  async delete(
    columnId: number,
    userId: number,
    boardId: number,
  ): Promise<string> {
    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: boardId },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '컬럼을 삭제 할 수 있는 권한이 존재하지 않습니다.',
      );
    }

    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    }); // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 조회
    if (!column) {
      throw new NotFoundException('컬럼이 존재하지 않습니다.'); // 컬럼이 존재하지 않을 경우 오류 발생
    }
    if (checkMember.id === column.memberId) {
      await this.columnRepository.delete(columnId); // 리포지토리 인스턴스를 사용해서 아이디를 조건으로 특정 컬럼 데이터를 삭제
      return `선택한 ${columnId} 컬럼이 삭제 되었습니다.`;
    }
  }
}
