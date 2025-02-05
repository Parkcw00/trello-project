import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { User } from '../user/entities/user.entity';
import { Board } from '../board/entities/board.entity';
import { NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';

describe('MemberService', () => {
  let service: MemberService;
  let memberRepository: jest.Mocked<Repository<Member>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let boardRepository: jest.Mocked<Repository<Board>>;

  beforeEach(async () => {
    // Jest Mock Repository 생성
    const mockMemberRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    const mockBoardRepository = {
      findOne: jest.fn(),
    };

    // NestJS 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService, // 실제 테스트할 MemberService 주입
        { provide: getRepositoryToken(Member), useValue: mockMemberRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Board), useValue: mockBoardRepository },
      ],
    }).compile();

    // 각 의존성을 모듈에서 가져오기
    service = module.get<MemberService>(MemberService);
    memberRepository = module.get(getRepositoryToken(Member));
    userRepository = module.get(getRepositoryToken(User));
    boardRepository = module.get(getRepositoryToken(Board));
  });

  /**
   * 특정 보드의 모든 멤버 목록 조회 테스트
   */
  describe('findAll', () => {
    it('보드가 존재하면 멤버 목록을 반환해야 함', async () => {
      boardRepository.findOne.mockResolvedValue({ id: 1 } as Board);
      memberRepository.find.mockResolvedValue([{ id: 1, userId: 2 } as Member]);

      const result = await service.findAll(1);

      expect(result).toEqual({ message: '멤버 조회 성공', members: [{ id: 1, userId: 2 }] });
    });

    it('보드가 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      boardRepository.findOne.mockResolvedValue(null);

      await expect(service.findAll(999)).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * 특정 멤버 조회 테스트
   */
  describe('findOne', () => {
    it('멤버가 존재하면 상세 정보를 반환해야 함', async () => {
      memberRepository.findOne.mockResolvedValue({ id: 1, userId: 2 } as Member);

      const result = await service.findOne(1, 1);

      expect(result).toEqual({ message: '멤버 상세 조회 성공', member: { id: 1, userId: 2 } });
    });

    it('멤버가 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      memberRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * 멤버 추가 테스트
   */
  describe('create', () => {
    it('멤버가 정상적으로 추가되면 성공 메시지를 반환해야 함', async () => {
      boardRepository.findOne.mockResolvedValue({ id: 1 } as Board);
      userRepository.findOne.mockResolvedValue({ id: 2 } as User);
      memberRepository.findOne.mockResolvedValue(null); // 중복 체크용
      memberRepository.create.mockReturnValue({ id: 3, boardId: 1, userId: 2 } as Member);
      memberRepository.save.mockResolvedValue({ id: 3, boardId: 1, userId: 2 } as Member);

      const createMemberDto = { userId: 2 };
      const result = await service.create(1, createMemberDto, 2);

      expect(result).toEqual({ message: '멤버가 추가되었습니다!' });
    });

    it('보드가 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      boardRepository.findOne.mockResolvedValue(null);
      const createMemberDto = { userId: 2 };

      await expect(service.create(999, createMemberDto, 2)).rejects.toThrow(NotFoundException);
    });

    it('중복된 멤버가 추가될 경우 ConflictException을 던져야 함', async () => {
      boardRepository.findOne.mockResolvedValue({ id: 1 } as Board);
      userRepository.findOne.mockResolvedValue({ id: 2 } as User);
      memberRepository.findOne.mockResolvedValue({ id: 3 } as Member); // 이미 존재하는 멤버

      const createMemberDto = { userId: 2 };

      await expect(service.create(1, createMemberDto, 2)).rejects.toThrow(ConflictException);
    });
  });

  /**
   * 멤버 삭제 테스트
   */
  describe('delete', () => {
    it('본인이 멤버일 경우 삭제가 성공해야 함', async () => {
      memberRepository.findOne.mockResolvedValue({ id: 1, boardId: 1, userId: 2 } as Member);

      const result = await service.delete(1, 1, 2);

      expect(result).toEqual({ message: '멤버 삭제 성공' });
      expect(memberRepository.remove).toHaveBeenCalledWith({ id: 1, boardId: 1, userId: 2 });
    });

    it('멤버가 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      memberRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(1, 999, 2)).rejects.toThrow(NotFoundException);
    });

    it('본인이 아닌 멤버를 삭제하려 하면 UnauthorizedException을 던져야 함', async () => {
      memberRepository.findOne.mockResolvedValue({ id: 1, boardId: 1, userId: 3 } as Member);

      await expect(service.delete(1, 1, 2)).rejects.toThrow(UnauthorizedException);
    });
  });
});
