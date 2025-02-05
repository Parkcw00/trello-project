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
  // 테스트에서 사용할 서비스와 레포지토리 변수 선언
  let service: ColumnService;
  let columnRepository: Repository<ColumnEntity>;
  let memberRepository: Repository<Member>;
  let boardRepository: Repository<Board>;
  let alarmRepository: Repository<Alarm>;

  // 컬럼 레포지토리를 위한 mock 객체 생성
  const mockColumnRepository = {
    create: jest.fn(),// 컬럼 생성
    save: jest.fn(),// 컬럼 저장
    find: jest.fn(),// 컬럼 목록 조회
    findOne: jest.fn(),// 특정 컬럼 조회
    update: jest.fn(),// 컬럼 업데이트
    delete: jest.fn(),// 컬럼 삭제
  };

  // 멤버 레포지토리를 위한 mock 객체 생성
  const mockMemberRepository = {
    findOne: jest.fn(),// 특정 멤버 조회
  };

  // 보드 레포지토리를 위한 mock 객체 생성

  const mockBoardRepository = {
    findOne: jest.fn(),// 특정 보드 조회
  };

  // 알람 레포지토리를 위한 mock 객체 생성
  const mockAlarmRepository = {
    create: jest.fn(),// 알람 생성
    save: jest.fn(),// 알람 저장
  };


  beforeEach(async () => {
    // 테스트 모듈 생성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnService,

        // 컬럼 레포지토리 제공
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: mockColumnRepository,
        },

        // 멤버 레포지토리 제공
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },

        // 보드 레포지토리 제공

        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },

        // 알람 레포지토리 제공

        {
          provide: getRepositoryToken(Alarm),
          useValue: mockAlarmRepository,
        },
      ],
    }).compile();

    // 테스트에서 사용할 서비스와 레포지토리 인스턴스 가져오기
    service = module.get<ColumnService>(ColumnService);
    columnRepository = module.get<Repository<ColumnEntity>>(getRepositoryToken(ColumnEntity));
    memberRepository = module.get<Repository<Member>>(getRepositoryToken(Member));
    boardRepository = module.get<Repository<Board>>(getRepositoryToken(Board));
    alarmRepository = module.get<Repository<Alarm>>(getRepositoryToken(Alarm));
  });

  // 서비스가 정상적으로 정의되었는지 확인하는 기본 테스트
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createColumn', () => {
    // 권한이 있는 사용자가 컬럼을 생성할 수 있는지 테스트
    it('권한이 있는 사용자가 컬럼을 생성할 수 있다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;

      // 컬럼 생성을 위한 데이터 설정
      const createColumnDto: CreateColumnDto = {
        columnType: '진행중',
      };


      // 권한 확인용 멤버 데이터 설정
      const mockMember = {
        id: 1,
        userId: userId,
        boardId: boardId,
      };

      // 멤버 권한 확인을 위한 mock 설정
      mockMemberRepository.findOne.mockResolvedValue(mockMember);

      // 기존 컬럼의 lexoRank 값을 위한 mock 설정
      const mockExistingColumn = {
        lexo: LexoRank.middle().toString()
      };
      mockColumnRepository.findOne.mockResolvedValue(mockExistingColumn);

      // 새로운 컬럼 생성을 위한 mock 설정
      mockColumnRepository.create.mockReturnValue({
        ...createColumnDto,
        memberId: mockMember.id,
        boardId: boardId,
        lexo: LexoRank.parse(mockExistingColumn.lexo).genNext().toString(),
      });

      // 컬럼 저장을 위한 mock 설정
      mockColumnRepository.save.mockResolvedValue({
        id: 1,
        ...createColumnDto,
        memberId: mockMember.id,
        boardId: boardId,
        lexo: LexoRank.parse(mockExistingColumn.lexo).genNext().toString(),
      });

      // 테스트할 메서드 실행
      const result = await service.create(userId, boardId, createColumnDto);

      // 결과 검증
      expect(result).toBeDefined();                           // 결과값이 존재하는지
      expect(result.columnType).toBe(createColumnDto.columnType);  // 컬럼 타입이 일치하는지
      expect(result.boardId).toBe(boardId);                   // 보드 ID가 일치하는지
      expect(result.memberId).toBe(mockMember.id);           // 멤버 ID가 일치하는지
      expect(result.lexo).toBeDefined();                     // lexoRank가 설정되었는지
    });

    it('권한이 없는 사용자는 컬럼을 생성할 수 없다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      const createColumnDto: CreateColumnDto = {
        columnType: '진행중',
      };

      // 권한이 없는 상황을 시뮬레이션
      mockMemberRepository.findOne.mockResolvedValue(null);

      // 권한이 없을 때 에러가 발생하는지 검증
      await expect(service.create(userId, boardId, createColumnDto))
        .rejects
        .toThrow('컬럼을 만들수 있는 권한이 존재하지 않습니다.');
    });

    it('첫 번째 컬럼 생성 시 중간 lexoRank를 가져야 한다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      const createColumnDto: CreateColumnDto = {
        columnType: 'todo',
      };

      // 권한 확인용 멤버 데이터 설정
      const mockMember = {
        id: 1,
        userId: userId,
        boardId: boardId,
      };

      // mock 응답 설정
      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      mockColumnRepository.findOne.mockResolvedValue(null);  // 첫 번째 컬럼이므로 null

      // 중간 lexoRank 값 생성
      const middleLexoRank = LexoRank.middle().toString();
      
      // 컬럼 생성 mock 설정
      mockColumnRepository.create.mockReturnValue({
        ...createColumnDto,
        memberId: mockMember.id,
        boardId: boardId,
        lexo: middleLexoRank,
      });

      // 컬럼 저장 mock 설정
      mockColumnRepository.save.mockResolvedValue({
        id: 1,
        ...createColumnDto,
        memberId: mockMember.id,
        boardId: boardId,
        lexo: middleLexoRank,
      });

      // 테스트할 메서드 실행
      const result = await service.create(userId, boardId, createColumnDto);

      // 결과 검증
      expect(result.lexo).toBe(middleLexoRank);  // lexoRank가 중간값인지 확인
      expect(mockColumnRepository.create).toHaveBeenCalledWith({
        columnType: createColumnDto.columnType,
        boardId: boardId,
        lexo: middleLexoRank,
        memberId: mockMember.id,
      });  // create 메서드가 올바른 파라미터로 호출되었는지
    });
  });

  describe('findColumns', () => {
    it('권한이 있는 사용자가 컬럼 목록을 조회할 수 있다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      // 조회될 컬럼 목록 mock 데이터 설정
      const mockColumns = [
        { id: 1, columnType: '시작' },
        { id: 2, columnType: '진행중' },
      ];

      // 멤버 권한 확인을 위한 mock 설정
      mockMemberRepository.findOne.mockResolvedValue({ 
        id: 1,
        userId,
        boardId 
      });

      // 컬럼 목록 조회를 위한 mock 설정
      mockColumnRepository.find.mockResolvedValue(mockColumns);

      // 테스트할 메서드 실행 (매개변수 순서: boardId, userId)
      const result = await service.findAll(boardId, userId);

      // 결과 검증
      expect(result).toEqual(mockColumns);  // 반환된 컬럼 목록이 예상과 일치하는지
      expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
        where: { userId, boardId }
      });  // 멤버 권한 확인이 올바른 파라미터로 호출되었는지
      expect(mockColumnRepository.find).toHaveBeenCalledWith({
        where: { boardId }
      });  // 컬럼 목록 조회가 올바른 파라미터로 호출되었는지
    });

    it('권한이 없는 사용자는 컬럼 목록을 조회할 수 없다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;

      // 권한이 없는 상황을 시뮬레이션 (멤버가 없음)
      mockMemberRepository.findOne.mockResolvedValue(null);

      // 권한이 없을 때 에러가 발생하는지 검증
      await expect(service.findAll(boardId, userId))
        .rejects
        .toThrow('컬럼을 조회 할 수 있는 권한이 존재하지 않습니다.');
    });
  });

  describe('findOneColumn', () => {
    it('권한이 있는 사용자가 특정 컬럼을 조회할 수 있다.', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      const columnId = 1;
      // 조회할 컬럼 데이터 mock 설정
      const mockColumns = [
        { id: 1, columnType: '시작'},
      ];

      // 멤버 권한 확인을 위한 mock 설정
      mockMemberRepository.findOne.mockResolvedValue({ 
        id: 1,
        userId,
        boardId 
      });

      // 실제 컬럼 조회를 위한 mock 설정
      mockColumnRepository.findOne.mockResolvedValue(mockColumns);

      // 테스트할 메서드 실행
      const result = await service.findOne(columnId, userId, boardId);

      // 결과 검증
      expect(result).toEqual(mockColumns);  // 반환된 컬럼 데이터가 예상과 일치하는지
      expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
        where: { userId, boardId }
      });  // 멤버 권한 확인이 올바른 파라미터로 호출되었는지
      expect(mockColumnRepository.findOne).toHaveBeenCalledWith({
        where: { id: columnId }
      });  // 컬럼 조회가 올바른 파라미터로 호출되었는지
    });

    it('권한이 없는 사용자는 컬럼을 조회할 수 없다.', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      const columnId = 1;

      // 권한이 없는 상황을 시뮬레이션 (멤버가 없음)
      mockMemberRepository.findOne.mockResolvedValue(null);

      // 권한이 없을 때 에러가 발생하는지 검증
      await expect(service.findOne(columnId, userId, boardId))
        .rejects
        .toThrow('컬럼을 조회 할 수 있는 권한이 존재하지 않습니다.');
    });
  });

  describe('deleteColumn', () => {
    it('권한이 있는 사용자가 컬럼을 삭제할 수 있다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      const columnId = 1;

      // 멤버 권한 확인을 위한 mock 설정 (권한 있는 사용자로 설정)
      mockMemberRepository.findOne.mockResolvedValue({ id: 1 });

      // 삭제할 컬럼이 존재하는지 확인하기 위한 mock 설정
      mockColumnRepository.findOne.mockResolvedValue({ id: columnId, boardId });

      // 컬럼 삭제 성공을 시뮬레이션하기 위한 mock 설정
      mockColumnRepository.delete.mockResolvedValue({ affected: 1 });

      // 삭제 메서드 실행 시 에러가 발생하지 않는지 테스트
      await expect(service.delete(userId, columnId, boardId)).resolves.not.toThrow();
    });

    // 여기에 추가적인 테스트 케이스를 작성할 수 있음
    // 예: 권한이 없는 경우, 컬럼이 존재하지 않는 경우 등
  });

  describe('updateColumnOrder', () => {
    it('권한이 있는 사용자가 컬럼의 위치를 변경할 수 있다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      const columnId = 1;
      const targetColumnId = 2;

      // 권한 확인용 멤버 데이터 설정
      const mockMember = {
        id: 1,
        userId,
        boardId,
      };

      // 컬럼 목록 데이터 설정 (lexoRank로 정렬된 3개의 컬럼)
      const mockColumns = [
        { id: 1, lexo: LexoRank.middle().toString() }, // 첫 번째 컬럼
        { id: 2, lexo: LexoRank.middle().genNext().toString() }, // 두 번째 컬럼
        { id: 3, lexo: LexoRank.middle().genNext().genNext().toString() }, // 세 번째 컬럼
      ];

      // 이동할 컬럼과 타겟 컬럼 설정
      const mockColumn = { id: columnId, lexo: mockColumns[0].lexo }; // 이동시킬 컬럼
      const mockTargetColumn = { id: targetColumnId, lexo: mockColumns[1].lexo };  // 목표 위치의 컬럼

      // 멤버 권한 확인을 위한 mock 설정
      mockMemberRepository.findOne.mockResolvedValue(mockMember);
      
      // 전체 컬럼 목록 조회를 위한 mock 설정
      mockColumnRepository.find.mockResolvedValue(mockColumns);
      
      // 개별 컬럼 조회를 위한 mock 설정 (순차적으로 다른 값 반환)
      mockColumnRepository.findOne
      // 1. 첫 번째 호출 시
        .mockResolvedValueOnce(mockColumn) // 반환값: { id: columnId, lexo: '초기 lexo 값' }
        // 2. 두 번째 호출 시
        .mockResolvedValueOnce(mockTargetColumn) // 반환값: { id: targetColumnId, lexo: '타겟 lexo 값' }
        // 3. 세 번째 호출 시
        .mockResolvedValueOnce({ ...mockColumn, lexo: expect.any(String) });  // 세 번째 호출: 업데이트된 컬럼 반환(lexo 값이 문자열이기만 하면 됨)

      // update 메서드가 성공적으로 실행됐을 때의 결과값 설정
      mockColumnRepository.update.mockResolvedValue({ affected: 1 });
      // affected: 1 은 1개의 행이 업데이트되었다는 의미입니다.

      // 실제 서비스의 updateColumnOrder 메서드 실행
      const result = await service.updateColumnOrder(boardId, columnId, targetColumnId, userId);

      // 결과 검증
      expect(result).toBeDefined(); // 결과가 null이나 undefined가 아닌지
      expect(result.id).toBe(columnId); // 반환된 컬럼의 ID가 올바른지
      expect(result.lexo).toBeDefined(); // lexoRank 값이 설정되었는지
    });

    it('권한이 없는 사용자는 컬럼의 위치를 변경할 수 없다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const userId = 1;
      const boardId = 1;
      const columnId = 1;
      const targetColumnId = 2;

      // 권한이 없는 상황을 시뮬레이션 (멤버가 없음)
      mockMemberRepository.findOne.mockResolvedValue(null);

      // 권한이 없을 때 에러가 발생하는지 검증
      await expect(service.updateColumnOrder(boardId, columnId, targetColumnId, userId))
        .rejects
        .toThrow('컬럼을 순서를 변경 할 수 있는 권한이 존재하지 않습니다.');
    });
  });
});
