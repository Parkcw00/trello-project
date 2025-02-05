import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { User } from '../user/entities/user.entity';
import { BoardDto } from './dto/board.dto';

describe('BoardController', () => {
  let boardController: BoardController;
  let boardService: BoardService;

  const mockUser: User = { id: 1 } as User; // Mock User 객체
  const mockBoardDto: BoardDto = {
    title: 'Test Board',
    content: 'Test Content',
  } as BoardDto; // Mock BoardDto 객체

  const mockBoardService = {
    getBoard: jest.fn().mockResolvedValue(mockBoardDto),
    getMyBoards: jest.fn().mockResolvedValue([mockBoardDto]),
    createBoard: jest.fn().mockResolvedValue(undefined),
    updateBoard: jest.fn().mockResolvedValue(mockBoardDto),
    deleteBoard: jest.fn().mockResolvedValue(undefined),
    linkBoard: jest.fn().mockResolvedValue('http://link-to-board.com'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
      ],
    }).compile();

    boardController = module.get<BoardController>(BoardController);
    boardService = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(boardController).toBeDefined();
  });

  describe('getBoard', () => {
    it('should return a board', async () => {
      const result = await boardController.getBoard(mockUser, 1);
      expect(result).toEqual(mockBoardDto);
      expect(mockBoardService.getBoard).toHaveBeenCalledWith(mockUser.id, 1);
    });
  });

  describe('getMyBoards', () => {
    it('should return my boards', async () => {
      const result = await boardController.getMyBoards(mockUser);
      expect(result).toEqual([mockBoardDto]);
      expect(mockBoardService.getMyBoards).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('createBoard', () => {
    it('should create a board', async () => {
      await boardController.createBoard(mockUser, mockBoardDto);
      expect(mockBoardService.createBoard).toHaveBeenCalledWith(
        mockUser.id,
        mockBoardDto,
      );
    });
  });

  describe('updateBoard', () => {
    it('should update a board', async () => {
      const result = await boardController.updateBoard(
        mockUser,
        1,
        mockBoardDto,
      );
      expect(result).toEqual(mockBoardDto);
      expect(mockBoardService.updateBoard).toHaveBeenCalledWith(
        1,
        mockUser.id,
        mockBoardDto,
      );
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', async () => {
      await boardController.deleteBoard(mockUser, 1);
      expect(mockBoardService.deleteBoard).toHaveBeenCalledWith(mockUser.id, 1);
    });
  });

  describe('linkBoard', () => {
    it('should return a link to the board', async () => {
      const result = await boardController.linkBoard(mockUser, 1);
      expect(result).toEqual('http://link-to-board.com');
      expect(mockBoardService.linkBoard).toHaveBeenCalledWith(1, mockUser.id);
    });
  });
});
