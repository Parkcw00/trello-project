import _ from 'lodash';
import { Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Board } from './entities/board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async getMyBoards(onerId: number) {
    return await this.boardRepository.findBy({
      ownerId: onerId,
    });
  }

  async getBoard(boardId: number) {
    return await this.boardRepository.findBy({
      id: boardId,
    });
  }

  async createBoard(
    onerId: number,
    title: string,
    content: string,
    expriyDate: Date,
  ) {
    await this.boardRepository.save({
      onerId: onerId,
      title: title,
      content: content,
      expriyDate: expriyDate,
    });
  }

  async updateBoard(
    id: number,
    onerId: number,
    title: string,
    content: string,
    expriyDate: Date,
  ) {
    await this.verifyMessage(id, onerId);
    await this.boardRepository.update({ id }, { title, content, expriyDate });
  }

  async deleteBoard(id: number, onerId: number) {
    await this.verifyMessage(id, onerId);
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
}
