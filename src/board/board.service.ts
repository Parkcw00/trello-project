import _ from 'lodash';
import { EntityManager, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Board } from './entities/board.entity';
import { Member } from '../member/entities/member.entity';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성
import { BoardDto } from './dto/board.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(Member)
    private memberRepository: Repository<Member>,

    private readonly redisService: RedisService, // RedisService 주입
  ) { }

  async getMyBoards(ownerId: number): Promise<Board[]> {
    // Redis에서 캐시된 보드 목록 조회
    const cachedBoards = await this.redisService.get(`boards:${ownerId}`);
    if (cachedBoards) {
      return cachedBoards; // 캐시된 데이터 반환
    }

    // 캐시가 없을 경우 데이터베이스에서 조회
    const boards = await this.boardRepository.findBy({
      ownerId: ownerId,
    });

    // 조회한 보드 목록을 Redis에 저장
    await this.redisService.set(`boards:${ownerId}`, boards, 60); // 60초 동안 캐시

    return boards;
  }

  async getBoard(ownerId: number, boardId: number): Promise<Board> {
    const member = await this.memberRepository.findOne({
      where: { userId: ownerId, boardId },
    });
    if (!member) {
      throw new NotFoundException('해당 보드에 대한 접근 권한이 없습니다.');
    }

    const cachedBoard = await this.redisService.get(`board:${boardId}`);
    if (cachedBoard) {
      return cachedBoard; // 캐시된 데이터 반환
    }

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`보드를 찾을 수 없습니다.`);
    }

    await this.redisService.set(`board:${boardId}`, board, 60); // Redis에 보드 정보 저장
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
    await this.redisService.del(`boards:${ownerId}`);
  }

  async updateBoard(
    id: number,
    ownerId: number,
    boardDto: BoardDto,
  ): Promise<void> {
    const { title, content, expriyDate } = boardDto;
    await this.verifyMessage(id, ownerId);
    await this.boardRepository.update({ id }, { title, content, expriyDate });
    await this.redisService.del(`board:${id}`);
  }

  async deleteBoard(ownerId: number, id: number): Promise<void> {
    await this.verifyMessage(id, ownerId);
    await this.boardRepository.delete({ id });
    await this.redisService.del(`board:${id}`);
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
