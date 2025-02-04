import _ from 'lodash';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Card } from 'src/card/entities/card.entity';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(Card) private cardRepository: Repository<Card>, // Board 리포지토리 추가
  ) {}

  // 댓글 생성 (사용자가 해당 보드에 속한 경우에만 댓글 작성 허용)
  async createComment(
    userId: number,
    createCommentDto: CreateCommentDto,
    cardId: number,
  ): Promise<Comment> {
    try {
      // 카드 조회 (컬럼 및 보드 정보 포함)
      const card = await this.cardRepository.findOne({
        where: { id: cardId },
        relations: ['column', 'column.board'],
      });

      console.log();
      console.log('Card:', card);

      if (!card) {
        throw new BadRequestException('카드를 찾을 수 없습니다.');
      }

      const boardId = card.column.board.id;

      // 사용자가 해당 보드의 멤버인지 확인
      const member = await this.memberRepository.findOne({
        where: { userId, boardId },
      });

      console.log({ member });
      if (!member) {
        throw new ForbiddenException('댓글 작성 권한이 없습니다.');
      }

      // 멤버 ID를 기반으로 댓글 생성
      const result = await this.commentRepository.save({
        ...createCommentDto,
        cardId,
        memberId: member.id, // 보드 멤버 ID 할당
      });
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('댓글 생성 중 오류가 발생했습니다.');
    }
  }

  // 댓글 조회 (보드 권한 체크 후 댓글 조회)
  async findComments(cardId: number, userId: number): Promise<Comment[]> {
    try {
      const card = await this.cardRepository.findOne({
        where: { id: cardId },
        relations: ['column', 'column.board'],
      });

      if (!card) {
        throw new BadRequestException('카드를 찾을 수 없습니다.');
      }

      const boardId = card.column.board.id;

      // 사용자가 해당 보드에 속한 경우에만 댓글 조회 허용
      const checkMember = await this.memberRepository.findOne({
        where: { userId, boardId },
      });

      if (!checkMember) {
        throw new ForbiddenException('댓글 조회 권한이 없습니다.');
      }

      return await this.commentRepository.find({
        where: { cardId },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('댓글 조회 중 오류가 발생했습니다.');
    }
  }

  // 댓글 상세 조회
  async findComment(
    cardId: number,
    commentId: number,
    userId: number,
  ): Promise<Comment> {
    try {
      const card = await this.cardRepository.findOne({
        where: { id: cardId },
        relations: ['column', 'column.board'],
      });

      if (!card) {
        throw new BadRequestException('카드를 찾을 수 없습니다.');
      }

      const boardId = card.column.board.id;

      // 사용자가 해당 보드에 속한 경우에만 댓글 조회 허용
      const checkMember = await this.memberRepository.findOne({
        where: { userId, boardId },
      });

      if (!checkMember) {
        throw new ForbiddenException('댓글 조회 권한이 없습니다.');
      }

      const comment = await this.commentRepository.findOne({
        where: { id: commentId, cardId },
      });

      if (!comment) {
        throw new BadRequestException('댓글이 존재하지 않습니다.');
      }

      return comment;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('댓글 조회 중 오류가 발생했습니다.');
    }
  }

  // 댓글 수정
  async updateComment(
    cardId: number,
    commentId: number,
    userId: number, // 유저Id
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      // 댓글 조회
      const comment = await this.commentRepository.findOne({
        where: { id: commentId, cardId },
        relations: ['card', 'card.column', 'card.column.board'], // 카드 -> 컬럼 -> 보드 관계 조회
      });

      if (!comment) {
        throw new BadRequestException('댓글을 찾을 수 없습니다.');
      }

      // 유저가 해당 보드의 멤버인지 확인
      const boardMember = await this.memberRepository.findOne({
        where: { userId: userId, boardId: comment.card.column.board.id },
      });

      if (!boardMember) {
        throw new ForbiddenException(
          '해당 보드의 멤버만 댓글을 수정할 수 있습니다.',
        );
      }

      // 작성자가 아닌 경우 수정 불가
      console.log('--------------', comment.memberId, boardMember.id);
      if (comment.memberId !== boardMember.id) {
        throw new ForbiddenException(
          '본인이 작성한 댓글만 수정할 수 있습니다.',
        );
      }

      // 댓글 수정
      await this.commentRepository.update(
        { id: commentId, cardId },
        updateCommentDto,
      );

      // 수정된 댓글 반환
      return await this.commentRepository.findOne({
        where: { id: commentId, cardId },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('댓글 업데이트 중 오류가 발생했습니다.');
    }
  }

  // 댓글 삭제
  async deleteComment(
    cardId: number,
    commentId: number,
    userId: number, // 유저Id
  ): Promise<void> {
    try {
      // 댓글 조회
      const comment = await this.commentRepository.findOne({
        where: { id: commentId, cardId },
        relations: ['card', 'card.column', 'card.column.board'], // 카드 -> 컬럼 -> 보드 관계 조회
      });

      if (!comment) {
        throw new BadRequestException('댓글을 찾을 수 없습니다.');
      }

      // 유저가 해당 보드의 멤버인지 확인
      const boardMember = await this.memberRepository.findOne({
        where: { userId: userId, boardId: comment.card.column.board.id },
      });

      if (!boardMember) {
        throw new ForbiddenException(
          '해당 보드의 멤버만 댓글을 삭제할 수 있습니다.',
        );
      }

      // 작성자가 아닌 경우 삭제 불가
      if (comment.memberId !== boardMember.id) {
        throw new ForbiddenException(
          '본인이 작성한 댓글만 삭제할 수 있습니다.',
        );
      }

      // 댓글 삭제
      const result = await this.commentRepository.delete({
        id: commentId,
        cardId,
      });

      if (result.affected === 0) {
        throw new BadRequestException('댓글 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('댓글 삭제 중 오류가 발생했습니다.');
    }
  }
}
