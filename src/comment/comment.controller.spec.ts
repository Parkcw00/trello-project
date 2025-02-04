import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from 'src/user/entities/user.entity';
import { Comment } from './entities/comment.entity';

describe('CommentController', () => {
  let controller: CommentController;
  let service: CommentService;

  const mockCommentService = {
    createComment: jest.fn(),
    findComments: jest.fn(),
    findComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: mockCommentService }],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    service = module.get<CommentService>(CommentService);
  });

  const mockUser: User = { id: 1, email: 'test@test.com' } as User;
  const mockComment: Comment = {
    id: 1,
    content: '테스트 댓글',
    cardId: 1,
    memberId: 1,
  } as Comment;

  const commentId = 1;
  const cardId = 1;

  describe('댓글 생성', () => {
    it('생성 성공 시 댓글 반환', async () => {
      const createDto: CreateCommentDto = { content: '테스트 댓글' };
      mockCommentService.createComment.mockResolvedValue(mockComment);

      const result = await controller.createComment(
        mockUser,
        cardId,
        createDto,
      );
      expect(mockCommentService.createComment).toHaveBeenCalledWith(
        mockUser.id,
        createDto,
        cardId,
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('댓글 조회', () => {
    it('전체 댓글 조회', async () => {
      mockCommentService.findComments.mockResolvedValue([mockComment]);

      const result = await controller.findComments(cardId, mockUser);
      expect(mockCommentService.findComments).toHaveBeenCalledWith(
        cardId,
        mockUser.id,
      );
      expect(result).toEqual([mockComment]);
    });

    it('단일 댓글 조회', async () => {
      mockCommentService.findComment.mockResolvedValue(mockComment);

      const result = await controller.findComment(cardId, commentId, mockUser);
      expect(mockCommentService.findComment).toHaveBeenCalledWith(
        cardId,
        commentId,
        mockUser.id,
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('댓글 수정', () => {
    it('댓글 수정 성공', async () => {
      const updateDto: UpdateCommentDto = { content: '수정된 댓글' };
      mockCommentService.updateComment.mockResolvedValue(mockComment);

      const result = await controller.updateComment(
        cardId,
        commentId,
        mockUser,
        updateDto,
      );
      expect(mockCommentService.updateComment).toHaveBeenCalledWith(
        cardId,
        commentId,
        mockUser.id,
        updateDto,
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('댓글 삭제', () => {
    it('댓글 삭제 성공', async () => {
      mockCommentService.deleteComment.mockResolvedValue(undefined);

      const result = await controller.deleteComment(
        cardId,
        commentId,
        mockUser,
      );
      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(
        cardId,
        commentId,
        mockUser.id,
      );
      expect(result).toEqual({ message: '댓글이 삭제되었습니다' });
    });
  });
});
