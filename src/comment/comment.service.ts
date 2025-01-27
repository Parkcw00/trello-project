import _ from 'lodash';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    // 인스턴스를 생성할때 쓰이는 메서드
    @InjectRepository(Comment) // 리포지토리 의존성 주입
    private commentRepository: Repository<Comment>, // 리포지토리 인스턴스 생성
  ) {} // 생성자 메서드

  // 에러처리 해야함
  async createComment(
    cardId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return await this.commentRepository.save({ ...createCommentDto, cardId });
  }

  async findComments(cardId: number): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { cardId },
    });
  }

  async findComment(cardId: number, commentId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, cardId },
    });

    if (!comment) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    return comment;
  }

  async updateComment(
    cardId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    await this.commentRepository.update(
      { id: commentId, cardId },
      updateCommentDto,
    );

    return await this.commentRepository.findOne({
      where: { id: commentId, cardId },
    });
  }

  async deleteComment(cardId: number, commentId: number): Promise<void> {
    const result = await this.commentRepository.delete({
      id: commentId,
      cardId,
    });

    if (result.affected === 0) {
      throw new BadRequestException('댓글을 찾지 못했습니다.');
    }
  }
}
