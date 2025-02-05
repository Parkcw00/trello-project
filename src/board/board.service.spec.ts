import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Member } from '../member/entities/member.entity';

describe('BoardService', () => {
  let service: BoardService;
  let boardRepository: Repository<Board>;
  let memberRepository: Repository<Member>;

  const mockBoard = {
    id: 1,
    title: '목제목',
    content: '목내용',
    gitLink: 'dmdpdp',
    expriyDate: new Date('2023-03-03'),
  };

  const mockBoardRepository = {
    findBy: jest.fn().mockResolvedValue([mockBoard]),
    findOne: jest.fn().mockResolvedValue(mockBoard),
    save: jest.fn().mockResolvedValue(mockBoard),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn().mockResolvedValue(null),
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

    service = module.get<BoardService>(BoardService);
    boardRepository = module.get<Repository<Board>>(getRepositoryToken(Board));
    memberRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a board', async () => {
    const boardDto = {
      title: '새 보드',
      content: '보드 내용',
      expriyDate: new Date('2023-03-03'), // Date 객체로 수정
    };
    await service.createBoard(1, boardDto);
    expect(boardRepository.save).toHaveBeenCalled();
    expect(memberRepository.save).toHaveBeenCalled();
  });
});
