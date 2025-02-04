import { Test, TestingModule } from '@nestjs/testing';
import { ColumnService } from './column.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Member } from 'src/member/entities/member.entity';
import { Board } from 'src/board/entities/board.entity';
import { Alarm } from 'src/alarm/entities/alarm.entity';
import { Repository } from 'typeorm';
import { CreateColumnDto } from './dto/create-column.dto';
import { LexoRank } from 'lexorank';

describe('ColumnService', () => {
  let service: ColumnService;
  let columnRepository: Repository<ColumnEntity>;
  let memberRepository: Repository<Member>;
  let boardRepository: Repository<Board>;
  let alarmRepository: Repository<Alarm>;

  const mockColumnRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
  };

  const mockBoardRepository = {
    findOne: jest.fn(),
  };

  const mockAlarmRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnService,
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: mockColumnRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
        {
          provide: getRepositoryToken(Alarm),
          useValue: mockAlarmRepository,
        },
      ],
    }).compile();

    service = module.get<ColumnService>(ColumnService);
    columnRepository = module.get<Repository<ColumnEntity>>(getRepositoryToken(ColumnEntity));
    memberRepository = module.get<Repository<Member>>(getRepositoryToken(Member));
    boardRepository = module.get<Repository<Board>>(getRepositoryToken(Board));
    alarmRepository = module.get<Repository<Alarm>>(getRepositoryToken(Alarm));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createColumn', () => {
    it('권한이 있는 사용자가 컬럼을 생성할 수 있다', async () => {
      const userId = 1;
      const boardId = 1;
      const createColumnDto: CreateColumnDto = {
        columnType: '진행중',
      };

      const mockMember = {
        id: 1,
        userId: userId,
        boardId: boardId,
      };

      const mockBoard = {
        id: boardId,
        title: '테스트 보드',
      };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBoardRepository.findOne.mockResolvedValue(mockBoard);
      mockColumnRepository.create.mockReturnValue({
        ...createColumnDto,
        memberId: mockMember.id,
        boardId: boardId,
        lexo: LexoRank.middle().toString(),
      });
      mockColumnRepository.save.mockResolvedValue({
        id: 1,
        ...createColumnDto,
        memberId: mockMember.id,
        boardId: boardId,
        lexo: LexoRank.middle().toString(),
      });

      const result = await service.create(userId, boardId, createColumnDto);

      expect(result).toBeDefined();
      expect(result.columnType).toBe(createColumnDto.columnType);
      expect(result.boardId).toBe(boardId);

    });

    it('컬럼이 생성 되고 저장되어야 한다', async () => {
      const userId = 1;
      const boardId = 1;
      const createColumnDto: CreateColumnDto = {
        columnType: 'todo',
      };

      const mockMember = {
        id: 1,
        userId: userId,
        boardId: boardId,
      };

      const mockBoard = {
        id: boardId,
        title: '테스트 보드',
      };

      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockBoardRepository.findOne.mockResolvedValue(mockBoard);
      mockColumnRepository.save.mockResolvedValue({
        id: 1,
        ...createColumnDto,
        memberId: mockMember.id,
        boardId: boardId,
      });

      await service.create(userId, boardId, createColumnDto);


      expect(mockColumnRepository.create).toHaveBeenCalled();
      expect(mockColumnRepository.save).toHaveBeenCalled();
    });
  });

  describe('findColumns', () => {
    it('권한이 있는 사용자가 컬럼 목록을 조회할 수 있다', async () => {
      const userId = 1;
      const boardId = 1;
      const mockColumns = [
        { id: 1, columnType: '시작' },
        { id: 2, columnType: '진행중' },
      ];

      mockMemberRepository.findOne.mockResolvedValue({ id: 1 });
      mockColumnRepository.find.mockResolvedValue(mockColumns);

      const result = await service.findAll(userId, boardId);


      expect(result).toEqual(mockColumns);
    });
  });

  describe('findOneColumn', () => {
    it('권한이 있는 사용자가 특정 컬럼을 조회할 수 있다.', async () => {
      const userId = 1;
      const boardId = 1;
      const columnId = 1;
      const mockColumns = [
        { id: 1, columnType: '시작'},
      ];


      // 멤버 권한 확인을 위한 mock
    mockMemberRepository.findOne.mockResolvedValue({ 
      id: 1,
      userId,
      boardId 
    });

    // 실제 컬럼 조회를 위한 mock
    mockColumnRepository.findOne.mockResolvedValue(mockColumns);

    const result = await service.findOne(columnId, userId, boardId);

    expect(result).toEqual(mockColumns);
    expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
      where: { userId, boardId }
    });
    expect(mockColumnRepository.findOne).toHaveBeenCalledWith({
      where: { id: columnId }
    });
  });

  it('권한이 없는 사용자는 컬럼을 조회할 수 없다.', async () => {
    const userId = 1;
    const boardId = 1;
    const columnId = 1;

    mockMemberRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(columnId, userId, boardId))
      .rejects
      .toThrow('컬럼을 조회 할 수 있는 권한이 존재하지 않습니다.');
  });
});

  describe('updateColumn', () => {
    it('권한이 있는 사용자가 컬럼의 위치를 변경할 수 있다.', async () => {
      const userId = 1;
    })
  })

  describe('deleteColumn', () => {
    it('권한이 있는 사용자가 컬럼을 삭제할 수 있다', async () => {
      const userId = 1;
      const boardId = 1;
      const columnId = 1;

      mockMemberRepository.findOne.mockResolvedValue({ id: 1 });
      mockColumnRepository.findOne.mockResolvedValue({ id: columnId, boardId });
      mockColumnRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete(userId, columnId, boardId)).resolves.not.toThrow();

    });

    
  });
});
