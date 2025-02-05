import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiTags('댓글CRUD')
@Controller('cards/:cardId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: '댓글 생성' })
  @Post()
  async createComment(
    @UserInfo() user: User,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return await this.commentService.createComment(
      user.id,
      createCommentDto,
      cardId,
    );
  }

  @ApiOperation({ summary: '전체 댓글 조회' })
  @Get()
  async findComments(
    @Param('cardId', ParseIntPipe) cardId: number,
    @UserInfo() user: User, // 사용자 정보를 통해 권한 체크
  ): Promise<Comment[]> {
    return await this.commentService.findComments(cardId, user.id);
  }

  @ApiOperation({ summary: '댓글 상세 조회' })
  @Get(':commentId')
  async findComment(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @UserInfo() user: User,
  ): Promise<Comment> {
    return await this.commentService.findComment(cardId, commentId, user.id);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @Patch(':commentId')
  async updateComment(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @UserInfo() user: User,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return await this.commentService.updateComment(
      cardId,
      commentId,
      user.id,
      updateCommentDto,
    );
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @Delete(':commentId')
  async deleteComment(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @UserInfo() user: User,
  ): Promise<{ message: string }> {
    await this.commentService.deleteComment(cardId, commentId, user.id);
    return { message: '댓글이 삭제되었습니다' };
  }
}
