import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Headers,
  UseGuards,
} from '@nestjs/common'; // 컨트롤러 데코레이터 가져오기
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('댓글CRUD')
@Controller('cards/:cardId/comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private jwtService: JwtService,
  ) {}
  // @UseGuards(RolesGuard) // 권한 검증 가져오기 ( 보통 여기서 검증을 진행 )
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '댓글 생성' })
  @Post()
  createComment(
    @Headers('authorization') authorization: string,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() CreateCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentService.createComment(
      authorization,
      cardId,
      CreateCommentDto,
    );
  }

  @ApiOperation({ summary: '전체 댓글 조회' })
  @Get()
  findComments(
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<Comment[]> {
    return this.commentService.findComments(cardId);
  }

  @ApiOperation({ summary: '댓글 상세 조회' })
  @Get(':commentId')
  findComment(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<Comment> {
    return this.commentService.findComment(cardId, commentId);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @Patch(':commentId')
  updateComment(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.commentService.updateComment(
      cardId,
      commentId,
      updateCommentDto,
    );
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @Delete(':commentId')
  async deleteComment(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<{ message: string }> {
    await this.commentService.deleteComment(cardId, commentId);
    return { message: '댓글이 삭제되었습니다' };
  }
}
