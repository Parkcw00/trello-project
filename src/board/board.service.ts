import _ from 'lodash';
import { Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Board } from './entities/board.entity';
import { v4 as uuidv4 } from 'uuid'; // UUID 생성
import { BoardDto } from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async getMyBoards(ownerId: number) {
    return await this.boardRepository.findBy({
      ownerId: ownerId,
    });
  }

  async getBoard(boardId: number) {
    //맴버 검증 추가하기
    return await this.boardRepository.findBy({
      id: boardId,
    });
  }

  async createBoard(ownerId: number, boardDto: BoardDto) {
    const { title, content, expriyDate } = boardDto;
    await this.boardRepository.save({
      ownerId: ownerId,
      title: title,
      content: content,
      expriyDate: expriyDate,
      gitLink: uuidv4(), // 초대 코드 생성
    });
  }

  async updateBoard(id: number, ownerId: number, boardDto: BoardDto) {
    const { title, content, expriyDate } = boardDto;
    await this.verifyMessage(id, ownerId);
    await this.boardRepository.update({ id }, { title, content, expriyDate });
  }

  async deleteBoard(id: number, ownerId: number) {
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
  // async linkBoard(id: number, ownerId: number, gitLink: string) {
  //   await this.verifyMessage(id, ownerId);
  //   return `${baseUrl}/boards/${gitLink}`; // 링크 생성
  // }
}
