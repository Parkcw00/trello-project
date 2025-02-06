import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Member } from '../member/entities/member.entity';
import { NotFoundException } from '@nestjs/common';
import { BoardDto } from './dto/board.dto';
import { EntityManager } from 'typeorm';

describe('BoardService', () => {
  let boardService: BoardService;

  const mockBoardRepository = {
    findBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
    manager: {
      transaction: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
      ],
    }).compile();

    boardService = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });

  describe('getMyBoards', () => {
    it('should return an array of boards', async () => {
      const result = [{ id: 1, title: 'Test Board' }];
      mockBoardRepository.findBy.mockResolvedValue(result);

      expect(await boardService.getMyBoards(1)).toEqual(result);
      expect(mockBoardRepository.findBy).toHaveBeenCalledWith({ ownerId: 1 });
    });
  });

  describe('getBoard', () => {
    beforeEach(() => {
      mockMemberRepository.findOne.mockResolvedValue({
        ownerId: 1,
        boardId: 1,
      });
      mockBoardRepository.findOne.mockResolvedValue({
        id: 1,
        title: 'Test Board',
        ownerId: 1,
      });
    });

    it('should return a board', async () => {
      const result = { id: 1, title: 'Test Board', ownerId: 1 };
      const board = await boardService.getBoard(1, 1);
      expect(board).toEqual(result);
    });
  });

  describe('createBoard', () => {
    let boardDto: BoardDto;

    beforeEach(() => {
      boardDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        expriyDate: new Date(),
      };
    });

    it('should create a board and member in a transaction', async () => {
      await mockBoardRepository.manager.transaction(
        async (transactionManager: EntityManager) => {
          const board = transactionManager.create(Board, {
            title: boardDto.title,
            content: boardDto.content,
            expriyDate: boardDto.expriyDate,
            ownerId: 1,
            gitLink: 'uuidv4()',
          });

          const savedBoard = await transactionManager.save(board);
          const member = transactionManager.create(Member, {
            board: savedBoard,
            userId: 1,
          });
          await transactionManager.save(member);

          expect(savedBoard).toBeDefined();
          expect(member).toBeDefined();
          expect(savedBoard.title).toBe(boardDto.title);
        },
      );
    });
  });

  describe('updateBoard', () => {
    it('should update a board', async () => {
      const boardDto: BoardDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        expriyDate: new Date(),
      };
      mockBoardRepository.findOneBy.mockResolvedValue({ id: 1, ownerId: 1 });

      await boardService.updateBoard(1, 1, boardDto);
      expect(mockBoardRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        boardDto,
      );
    });

    it('should throw NotFoundException if board is not found or unauthorized', async () => {
      mockBoardRepository.findOneBy.mockResolvedValue(null);
      await expect(
        boardService.updateBoard(1, 1, {
          title: 'Dummy',
          content: 'Content',
          expriyDate: new Date(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', async () => {
      mockBoardRepository.findOneBy.mockResolvedValue({ id: 1, ownerId: 1 });

      await boardService.deleteBoard(1, 1);
      expect(mockBoardRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if board is not found or unauthorized', async () => {
      mockBoardRepository.findOneBy.mockResolvedValue(null);
      await expect(boardService.deleteBoard(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('linkBoard', () => {
    it('should return a link for the board', async () => {
      const board = { id: 1, gitLink: 'some-uuid' };
      mockBoardRepository.findOne.mockResolvedValue(board);
      mockBoardRepository.findOneBy.mockResolvedValue({ id: 1, ownerId: 1 });

      const result = await boardService.linkBoard(1, 1);
      expect(result).toEqual('http://example.com/boards/some-uuid');
    });

    it('should throw NotFoundException if board is not found or unauthorized', async () => {
      mockBoardRepository.findOneBy.mockResolvedValue(null);
      await expect(boardService.linkBoard(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
