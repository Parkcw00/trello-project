import { Test, TestingModule } from '@nestjs/testing';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { User } from 'src/user/entities/user.entity';
import { ColumnEntity } from './entities/column.entity';

describe('ColumnController', () => {
  let controller: ColumnController;
  let service: ColumnService;

  // 컬럼 서비스의 모든 메서드를 mock으로 구현한 객체
  const mockColumnService = {
    create: jest.fn(),          // 컬럼 생성 mock 함수
    findAll: jest.fn(),         // 컬럼 목록 조회 mock 함수
    findOne: jest.fn(),         // 단일 컬럼 조회 mock 함수
    updateColumnOrder: jest.fn(), // 컬럼 순서 수정 mock 함수
    delete: jest.fn(),          // 컬럼 삭제 mock 함수
  };

  // 테스트에서 사용할 가짜 사용자 데이터
  const mockUser: Partial<User> = {
    id: 1,                      // 사용자 ID
    email: 'test@test.com',     // 사용자 이메일
  };

  // 각 테스트 실행 전에 실행되는 설정
  beforeEach(async () => {
    // 테스트 모듈 생성 및 설정
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnController],  // 테스트할 컨트롤러 등록
      providers: [
        {
          provide: ColumnService,       // 컬럼 서비스 의존성 주입
          useValue: mockColumnService,  // mock 서비스 사용
        },
      ],
    }).compile();

    // 테스트에서 사용할 컨트롤러와 서비스 인스턴스 가져오기
    controller = module.get<ColumnController>(ColumnController);
    service = module.get<ColumnService>(ColumnService);
  });

  // 컨트롤러가 정상적으로 정의되었는지 확인하는 기본 테스트
  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  // 컬럼 생성 관련 테스트 그룹
  describe('create', () => {
    it('컬럼을 생성할 수 있어야 합니다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const boardId = 1;
      const createColumnDto: CreateColumnDto = {
        columnType: 'TODO',
      };

      // 예상되는 결과값 설정
      const expectedResult = {
        id: 1,
        ...createColumnDto,
      };

      // 서비스의 create 메서드가 반환할 값 설정
      mockColumnService.create.mockResolvedValue(expectedResult);

      // 컨트롤러의 create 메서드 실행
      const result = await controller.create(mockUser as User, boardId, createColumnDto);

      // 결과 검증
      expect(result).toEqual(expectedResult);  // 반환값이 예상과 일치하는지
      expect(mockColumnService.create).toHaveBeenCalledWith(
        mockUser.id,
        boardId,
        createColumnDto,
      );  // 서비스 메서드가 올바른 파라미터로 호출되었는지
    });
  });

  describe('findAll', () => {
    it('보드의 모든 컬럼을 조회할 수 있어야 합니다', async () => {
      // 테스트에 사용할 보드 ID 설정
      const boardId = 1;

      // 예상되는 컬럼 목록 데이터 설정
      const expectedColumns = [
        { id: 1, title: '컬럼1' },
        { id: 2, title: '컬럼2' },
      ];

      // 서비스의 findAll 메서드가 반환할 값 설정
      mockColumnService.findAll.mockResolvedValue(expectedColumns);

      // 컨트롤러의 findAll 메서드 실행
      const result = await controller.findAll(mockUser as User, boardId);

      // 결과 검증
      expect(result).toEqual(expectedColumns);  // 반환된 컬럼 목록이 예상과 일치하는지
      expect(mockColumnService.findAll).toHaveBeenCalledWith(boardId, mockUser.id);  // 서비스 메서드가 올바른 파라미터로 호출되었는지
    });
  });

  describe('findOne', () => {
    it('특정 컬럼을 조회할 수 있어야 합니다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const boardId = 1;
      const columnId = 1;
      
      // 예상되는 조회 결과 데이터 설정
      const expectedColumn = {
        id: columnId,
        columnType: 'TODO',
      };

      // 서비스의 findOne 메서드가 반환할 값 설정
      mockColumnService.findOne.mockResolvedValue(expectedColumn);

      // 컨트롤러의 findOne 메서드 실행
      const result = await controller.findOne(columnId, mockUser as User, boardId);

      // 결과 검증
      expect(result).toEqual(expectedColumn);  // 반환된 컬럼 데이터가 예상과 일치하는지
      expect(mockColumnService.findOne).toHaveBeenCalledWith(
        columnId,
        mockUser.id,
        boardId,
      );  // 서비스 메서드가 올바른 파라미터로 호출되었는지
    });
  });

  describe('update', () => {
    it('컬럼의 순서를 업데이트할 수 있어야 합니다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const boardId = 1;
      const columnId = 1;
      const targetColumnId = 2;

      // 예상되는 업데이트 결과 데이터 설정
      const expectedResult: Partial<ColumnEntity> = {
        id: columnId,
        columnType: 'TODO',
      };

      // 서비스의 updateColumnOrder 메서드가 반환할 값 설정
      mockColumnService.updateColumnOrder.mockResolvedValue(expectedResult);

      // 컨트롤러의 update 메서드 실행
      const result = await controller.update(
        boardId,
        columnId,
        targetColumnId,
        mockUser as User,
      );

      // 결과 검증
      expect(result).toEqual(expectedResult);  // 반환된 컬럼 데이터가 예상과 일치하는지
      expect(mockColumnService.updateColumnOrder).toHaveBeenCalledWith(
        boardId,
        columnId,
        targetColumnId,
        mockUser.id,
      );  // 서비스 메서드가 올바른 파라미터로 호출되었는지
    });
  });

  describe('remove', () => {
    it('컬럼을 삭제할 수 있어야 합니다', async () => {
      // 테스트에 사용할 기본 데이터 설정
      const boardId = 1;
      const columnId = 1;
      
      // 예상되는 삭제 결과 메시지 설정
      const expectedResult = { message: '컬럼이 삭제되었습니다' };

      // 서비스의 delete 메서드가 반환할 값 설정
      mockColumnService.delete.mockResolvedValue(expectedResult);

      // 컨트롤러의 remove 메서드 실행
      const result = await controller.remove(columnId, mockUser as User, boardId);

      // 결과 검증
      expect(result).toEqual(expectedResult);  // 반환된 메시지가 예상과 일치하는지
      expect(mockColumnService.delete).toHaveBeenCalledWith(
        columnId,
        mockUser.id,
        boardId,
      );  // 서비스 메서드가 올바른 파라미터로 호출되었는지
    });
  });
});
