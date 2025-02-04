import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Card } from 'src/card/entities/card.entity';
import { Member } from 'src/member/entities/member.entity';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { update } from 'lodash';

describe('CommentService', () => {
  let service: CommentService;
  let commentRepo: jest.Mocked<Repository<Comment>>;
  // Mock Comment Repository: 댓글 관련 메소드 Mock
  const mockCommentRepository = {
    findComments: jest.fn(),
    findComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  // Mock Card Repository: 카드 관련 메소드 Mock
  const mockCardRepository = {
    findOne: jest.fn(),
  };

  // Mock Member Repository: 멤버 관련 메소드 Mock
  const mockMemberRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository, // Comment repository Mock
        },
        {
          provide: getRepositoryToken(Card), // Card repository Mock
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(Member), // Member repository Mock
          useValue: mockMemberRepository,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService); // 서비스 객체 주입
    commentRepo = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    ) as jest.Mocked<Repository<Comment>>;
  });

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후 Mock 객체 초기화
  });

  describe('createComment', () => {
    it('유저가 해당 보드의 멤버일때만 댓글이 생성되어야 함!', async () => {
      const userId = 1;
      const cardId = 1;
      const createCommentDto = { content: '테스트 댓글' };

      // 카드 정보를 Mock으로 반환 (boardId가 1인 카드)
      mockCardRepository.findOne.mockResolvedValue({
        id: cardId,
        column: { board: { id: 1 } },
      });

      // 해당 유저가 boardId = 1번 보드의 멤버라고 가정
      mockMemberRepository.findOne.mockResolvedValue({
        id: 1,
        userId: userId,
        boardId: 1,
      });

      // Mock Comment create and save
      const createdComment = {
        content: '테스트 댓글',
        cardId: 1,
        memberId: 1,
      };
      const savedComment = {
        id: 1,
        ...createdComment,
      };

      mockCommentRepository.save.mockResolvedValue(savedComment);

      // 실제 서비스 함수 호출
      const result = await service.createComment(
        userId,
        createCommentDto,
        cardId,
      );

      // 카드 정보를 조회하는 findOne
      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: cardId },
        relations: ['column', 'column.board'],
      });

      // 보드 멤버 정보를 조회하는 findOne
      expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
        where: { userId, boardId: 1 },
      });

      // 댓글을 저장하는 createComment
      expect(mockCommentRepository.save).toHaveBeenCalledWith({
        ...createCommentDto,
        cardId,
        memberId: 1,
      });

      // 반환된 댓글 결과가 예상한 형태인지 확인
      // Check Comment save call
      expect(mockCommentRepository.save).toHaveBeenCalledWith(createdComment);

      // Check the result
      expect(result).toEqual(savedComment);
    });
  });

  describe('findComments', () => {
    it('사용자가 보드의 멤버일 경우 카드의 댓글을 조회해야 함!', async () => {
      const userId = 1;
      const cardId = 1;

      // 카드 데이터
      mockCardRepository.findOne.mockResolvedValue({
        id: cardId,
        column: { board: { id: 1 } },
      });

      //사용자가 보드의 멤버임을 확인
      mockMemberRepository.findOne.mockResolvedValue({
        id: 1,
        userId: userId,
        boardId: 1,
      });

      // 카드의 댓글 데이터
      const mockComments = [
        { id: 1, content: '댓글 1', cardId: cardId, memberId: 1 },
        { id: 2, content: '댓글 2', cardId: cardId, memberId: 1 },
      ];

      mockCommentRepository.find.mockResolvedValue(mockComments);

      // 서비스 메서드 호출
      const result = await service.findComments(cardId, userId);

      // 검증: 카드 정보 조회
      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: cardId },
        relations: ['column', 'column.board'],
      });

      // 검증: 사용자가 보드의 멤버인지 확인
      expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
        where: { userId, boardId: 1 },
      });

      // 검증: 댓글 조회
      expect(mockCommentRepository.find).toHaveBeenCalledWith({
        where: { cardId },
      });

      // 결과 검증
      expect(result).toEqual(mockComments);
    });
  });

  describe('findComment', () => {
    it('사용자가 보드의 멤버일 경우 특정 댓글을 조회해야 함', async () => {
      const userId = 1;
      const cardId = 1;
      const commentId = 1;

      // 카드 데이터
      mockCardRepository.findOne.mockResolvedValue({
        id: cardId,
        column: { board: { id: 1 } },
      });

      //사용자가 보드의 멤버임을 확인
      mockMemberRepository.findOne.mockResolvedValue({
        id: 1,
        userId: userId,
        boardId: 1,
      });

      //특정 댓글 데이터
      const mockComment = {
        id: commentId,
        content: '댓글 내용',
        cardId,
        memberId: 1,
      };
      mockCommentRepository.findOne.mockResolvedValue(mockComment);

      // 서비스 메서드 호출
      const result = await service.findComment(cardId, commentId, userId);

      //카드 정보 조회
      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: cardId },
        relations: ['column', 'column.board'],
      });

      // 사용자가 보드의 멤버인지 확인
      expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
        where: { userId, boardId: 1 },
      });

      // 댓글 조회
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith({
        where: { id: commentId, cardId },
      });

      // 결과 검증
      expect(result).toEqual(mockComment);
    });

    describe('updateComment', () => {
      it('작성자가 보드 멤버일 때 댓글 수정 성공!', async () => {
        const cardId = 1;
        const commentId = 1;
        const userId = 1;
        const updateCommentDto = { content: '수정된 댓글' };

        // 카드 조회 Mock
        mockCardRepository.findOne.mockResolvedValue({
          id: cardId,
          column: { board: { id: 1 } },
        });

        // 댓글 조회
        const existingComment = {
          id: commentId,
          content: '오혜성 바보',
          cardId,
          memberId: 1,
          card: { column: { board: { id: 1 } } },
        };
        mockCommentRepository.findOne.mockResolvedValue(existingComment);

        // 보드 멤버 조회
        mockMemberRepository.findOne.mockResolvedValue({
          id: 1,
          userId,
          boardId: 1,
        });

        // 업데이트 후 반환될 댓글 Mock
        const updatedComment = { ...existingComment, ...updateCommentDto }; // 나중에 오는 updateCommentDto의 comment가 기존의 comment를 덮어 씌움!
        mockCommentRepository.findOne.mockResolvedValue(updatedComment);

        // 서비스 메서드 호출
        const result = await service.updateComment(
          cardId,
          commentId,
          userId,
          updateCommentDto,
        );

        // 검증: 댓글 업데이트 호출
        expect(mockCommentRepository.update).toHaveBeenCalledWith(
          { id: commentId, cardId },
          updateCommentDto,
        );
        expect(result).toEqual(updatedComment);
      });
    });

    describe('deleteComment', () => {
      it('작성자가 보드 멤버일 때 댓글 삭제 성공!', async () => {
        const userId = 1;
        const cardId = 1;
        const commentId = 1;

        // 카드 조회 Mock
        mockCardRepository.findOne.mockResolvedValue({
          id: cardId,
          column: { board: { id: 1 } },
        });

        // 댓글 조회
        const existingComment = {
          id: commentId,
          memberId: 1,
          card: { column: { board: { id: 1 } } },
        };
        mockCommentRepository.findOne.mockResolvedValue(existingComment);

        // 보드 멤버 조회
        mockMemberRepository.findOne.mockResolvedValue({
          id: 1,
          userId,
          boardId: 1,
        });

        // 삭제 Mock
        mockCommentRepository.delete.mockResolvedValue({ affected: 1 } as any);

        // 서비스 메서드 호출
        await service.deleteComment(cardId, commentId, userId);

        // 검증: 삭제 메서드 호출 확인
        expect(mockCommentRepository.delete).toHaveBeenCalledWith({
          id: commentId,
          cardId,
        });
      });

      it('존재하지 않는 댓글 삭제 시 에러 발생시키기 ㅋㅋ', async () => {
        const userId = 1;
        const cardId = 1;
        const commentId = 999;

        // 댓글 조회 Mock (null 반환)
        mockCommentRepository.findOne.mockResolvedValue(null);

        // 에러발생되는지 체크!
        await expect(
          service.deleteComment(cardId, commentId, userId),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
