import _ from 'lodash';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtService } from '@nestjs/jwt';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class CommentService {
  constructor(
    // 인스턴스를 생성할때 쓰이는 메서드
    @InjectRepository(Comment) // 리포지토리 의존성 주입
    private commentRepository: Repository<Comment>,
    @InjectRepository(Member) // ✅ MemberRepository 주입
    private readonly memberRepository: Repository<Member>,
    private jwtService: JwtService, // 리포지토리 인스턴스 생성
  ) {} // 생성자 메서드

  // 에러처리 해야함
  async createComment(
    authorization: string,
    cardId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    try {
      if (!authorization) {
        throw new UnauthorizedException('JWT 토큰이 필요합니다.');
      }

      const token = authorization.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('JWT 토큰이 유효하지 않습니다.');
      }
      const payload = this.jwtService.verify(token);
      console.log('----------------', payload);
      const myId = payload.id;
      console.log('----------------', myId);
      if (!myId) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      const checkMember = await this.memberRepository.findOne({
        where: { id: createCommentDto.memberId, userId: myId },
      });
      console.log('--------------', checkMember);

      if (!checkMember) {
        throw new BadRequestException('댓글 작성 권한이 없습니다.');
      }
      return await this.commentRepository.save({ ...createCommentDto, cardId });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('댓글 생성 중 오류가 발생했습니다.');
    }
  }

  async findComments(cardId: number): Promise<Comment[]> {
    try {
      return await this.commentRepository.find({
        where: { cardId },
      });
    } catch (error) {
      throw new BadRequestException('댓글 조회 중 오류가 발생했습니다.');
    }
  }

  async findComment(cardId: number, commentId: number): Promise<Comment> {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId, cardId },
      });

      if (!comment) {
        throw new BadRequestException('댓글이 존재하지 않습니다.');
      }

      return comment;
    } catch (error) {
      throw new BadRequestException('댓글 조회 중 오류가 발생했습니다.');
    }
  }

  async updateComment(
    cardId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      await this.commentRepository.update(
        { id: commentId, cardId },
        updateCommentDto,
      );

      return await this.commentRepository.findOne({
        where: { id: commentId, cardId },
      });
    } catch (error) {
      throw new BadRequestException('댓글 업데이트 중 오류가 발생했습니다.');
    }
  }

  async deleteComment(cardId: number, commentId: number): Promise<void> {
    try {
      const result = await this.commentRepository.delete({
        id: commentId,
        cardId,
      });

      if (result.affected === 0) {
        throw new BadRequestException('댓글을 찾지 못했습니다.');
      }
    } catch (error) {
      throw new BadRequestException('댓글 삭제 중 오류가 발생했습니다.');
    }
  }
}
