import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardDto } from './dto/board.dto';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get(':boardId') // 보드 상세조회
  async getBoard(@Param('boardId') boardId: number) {
    return await this.boardService.getBoard(boardId);
  }

  @Get() //내 보드들 조회
  async getMyBoards(/*@UserInfo() user: User*/) {
    return await this.boardService.getMyBoards(2 /*user.id*/);
  }

  @Post() //보드 생성
  async createBoard(
    /*@UserInfo() user: User*/
    @Body() boardDto: BoardDto,
  ) {
    await this.boardService.createBoard(/*user.id*/ 2, boardDto);
  }

  @Patch(':boardId')
  async updateBoard(
    /*@UserInfo() user: User*/
    @Param('boardId') boardId: number,
    @Body() boardDto: BoardDto,
  ) {
    return await this.boardService.updateBoard(
      boardId,
      /*user.id*/ 2,
      boardDto,
    );
  }

  @Delete(':boardId')
  async deleteBoard(
    /*@UserInfo() user: User*/
    @Param('boardId') boardId: number,
  ) {
    return await this.boardService.deleteBoard(boardId, 2 /*user.id*/);
  }
}
