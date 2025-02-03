import _ from 'lodash';
import { EntityManager, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Board } from './entities/board.entity';
import { Member } from './../member/entities/member.entity';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성
import { BoardDto } from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async getMyBoards(ownerId: number): Promise<Board[]> {
    return await this.boardRepository.findBy({
      ownerId: ownerId,
    });
  }

  async getBoard(boardId: number): Promise<Board> {
    const member = await this.memberRepository.findBy({
      //보드에 속한 맴버만 볼수 있게 검증
      boardId: boardId,
    });
    if (!member) {
      throw new NotFoundException('해당 보드에 대한 접근 권한이 없습니다.');
    }
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`보드를 찾을 수 없습니다.`);
    }
    return board;
  }

  async createBoard(ownerId: number, boardDto: BoardDto): Promise<void> {
    const { title, content, expriyDate } = boardDto;
    await this.boardRepository.manager.transaction(
      //entityManager를 통해 여러 데이터베이스 작업을 하나의 트랙잭션으로 묶어 실행가능
      async (entityManager: EntityManager) => {
        // 보드 생성
        const newBoard = entityManager.create(Board, {
          ownerId,
          title,
          content,
          expriyDate,
          gitLink: uuidv4(), // 초대 코드 생성
        });

        const savedBoard = await entityManager.save(newBoard);

        // 오너를 멤버 테이블에 추가
        const member = entityManager.create(Member, {
          //맴버추가 예시 변경필요
          board: savedBoard, // 생성된 보드와의 관계 설정
          userId: ownerId, // 오너의 ID
        });

        await entityManager.save(member);
      },
    );
  }

  async updateBoard(
    id: number,
    ownerId: number,
    boardDto: BoardDto,
  ): Promise<void> {
    const { title, content, expriyDate } = boardDto;
    await this.verifyMessage(id, ownerId);
    await this.boardRepository.update({ id }, { title, content, expriyDate });
  }

  async deleteBoard(id: number, ownerId: number): Promise<void> {
    await this.verifyMessage(id, ownerId);
    await this.boardRepository.delete({ id });
  }

  private async verifyMessage(id: number, ownerId: number) {
    const boardMessage = await this.boardRepository.findOneBy({
      id,
    });

    if (_.isNil(boardMessage) || boardMessage.ownerId !== ownerId) {
      throw new NotFoundException(
        '보드를 찾을 수 없거나 수정/삭제할 권한이 없습니다.',
      );
    }
  }

  async linkBoard(id: number, ownerId: number) {
    await this.verifyMessage(id, ownerId);
    const board = await this.boardRepository.findOne({
      where: { id: id },
    });

    const baseUrl = 'http://example.com/boards'; // 실제 도메인으로 변경
    return `${baseUrl}/${board.gitLink}`; // 링크 생성
  }
}
