import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardDto } from './dto/board.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from './../utils/userInfo.decorator';
import { User } from '../user/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiTags('보드CRUD')
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}
  @ApiOperation({ summary: '보드 상세조회' })
  @Get(':boardId') // 보드 상세조회
  async getBoard(@UserInfo() user: User, @Param('boardId') boardId: number) {
    return await this.boardService.getBoard(user.id, boardId);
  }
  @ApiOperation({ summary: '내 보드들 조회' })
  @Get() //내 보드들 조회
  async getMyBoards(@UserInfo() user: User) {
    return await this.boardService.getMyBoards(user.id);
  }
  @ApiOperation({ summary: '보드 생성' })
  @Post() //보드 생성
  async createBoard(@UserInfo() user: User, @Body() boardDto: BoardDto) {
    await this.boardService.createBoard(user.id, boardDto);
  }
  @ApiOperation({ summary: '보드 수정' })
  @Patch(':boardId') //보드 수정
  async updateBoard(
    @UserInfo() user: User,
    @Param('boardId') boardId: number,
    @Body() boardDto: BoardDto,
  ) {
    return await this.boardService.updateBoard(boardId, user.id, boardDto);
  }
  @ApiOperation({ summary: '보드 삭제' })
  @Delete(':boardId') //보드 삭제
  async deleteBoard(@UserInfo() user: User, @Param('boardId') boardId: number) {
    return await this.boardService.deleteBoard(user.id, boardId);
  }
  @ApiOperation({ summary: '보드 링크' })
  @Get(':boardId/link') //보드 링크
  async linkBoard(@UserInfo() user: User, @Param('boardId') boardId: number) {
    return await this.boardService.linkBoard(boardId, user.id);
  }
}
