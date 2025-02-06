import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Member } from './entities/member.entity';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

describe('MemberController', () => {
  let memberController: MemberController;
  let memberService: MemberService;

  beforeEach(async () => {
    // MemberService의 가짜(Mock) 객체를 생성하여 실제 DB 접근을 방지하고 테스트 속도를 향상
    const mockMemberService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    // JWT 인증을 Mock 객체로 설정하여 실제 인증을 거치지 않고 테스트 가능하도록 처리
    const mockAuthGuard = {
      canActivate: jest.fn((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 1 }; // Mock JWT 인증된 사용자 정보 추가
        return true; // 모든 요청을 인증된 것으로 처리
      }),
    };

    // NestJS 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController], // 테스트할 컨트롤러 등록
      providers: [
        {
          provide: MemberService,
          useValue: mockMemberService, // MemberService를 Mock 객체로 대체하여 주입
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt')) // 실제 AuthGuard를 Mock 객체로 대체하여 JWT 인증 우회
      .useValue(mockAuthGuard)
      .compile();

    memberController = module.get<MemberController>(MemberController);
    memberService = module.get<MemberService>(MemberService);
  });

  /**
   * 특정 보드의 모든 멤버 목록을 조회하는 테스트
   */
  describe('findAll', () => {
    it('멤버 목록을 반환해야 함', async () => {
      // Mock 멤버 데이터 설정
      const mockMembers: Member[] = [{ id: 1, userId: 1, boardId: 1 } as Member];

      // MemberService의 findAll이 가짜 데이터를 반환하도록 설정
      jest.spyOn(memberService, 'findAll').mockResolvedValue({
        message: '멤버 조회 성공',
        members: mockMembers,
      });

      // findAll 실행
      const result = await memberController.findAll(1);

      // 반환값 검증
      expect(result).toEqual({ message: '멤버 조회 성공', members: mockMembers });
      expect(memberService.findAll).toHaveBeenCalledWith(1); // findAll이 호출되었는지 확인
    });
  });

  /**
   * 특정 멤버 조회 테스트
   */
  describe('findOne', () => {
    it('특정 멤버 정보를 반환해야 함', async () => {
      // Mock 멤버 데이터 설정
      const mockMember: Member = { id: 2, userId: 3, boardId: 1 } as Member;

      // MemberService의 findOne이 가짜 데이터를 반환하도록 설정
      jest.spyOn(memberService, 'findOne').mockResolvedValue({
        message: '멤버 상세 조회 성공',
        member: mockMember,
      });

      // findOne 실행
      const result = await memberController.findOne(1, 2);

      // 반환값 검증
      expect(result).toEqual({ message: '멤버 상세 조회 성공', member: mockMember });
      expect(memberService.findOne).toHaveBeenCalledWith(1, 2);
    });
  });

  /**
   * 멤버 추가 테스트
   */
  describe('create', () => {
    it('새로운 멤버를 추가해야 함', async () => {
      const dto: CreateMemberDto = { userId: 3 };

      // MemberService의 create가 실행되면 성공 메시지를 반환하도록 설정
      jest.spyOn(memberService, 'create').mockResolvedValue({ message: '멤버가 추가되었습니다!' });

      // 요청 객체(req) 생성 - JWT 인증된 사용자 정보 포함
      const mockRequest = { user: { id: 1 } };

      // create 실행
      const result = await memberController.create(1, dto, mockRequest);

      // 반환값 검증
      expect(result).toEqual({ message: '멤버가 추가되었습니다!' });
      expect(memberService.create).toHaveBeenCalledWith(1, dto, 1);
    });
  });

  /**
   * 멤버 삭제 테스트
   */
  describe('delete', () => {
    it('멤버 삭제 성공', async () => {
      // MemberService의 delete가 실행되면 성공 메시지를 반환하도록 설정
      jest.spyOn(memberService, 'delete').mockResolvedValue({ message: '멤버 삭제 성공' });

      // JWT 인증된 사용자 정보 포함
      const mockRequest = { user: { id: 1 } };

      // delete 실행
      const result = await memberController.delete(1, 2, mockRequest);

      // 반환값 검증
      expect(result).toEqual({ message: '멤버 삭제 성공' });
      expect(memberService.delete).toHaveBeenCalledWith(1, 2, 1);
    });

    it('본인이 아닌 멤버 삭제 시 UnauthorizedException 발생', async () => {
      // MemberService의 delete가 UnauthorizedException을 반환하도록 설정
      jest.spyOn(memberService, 'delete').mockRejectedValue(new UnauthorizedException('해당 멤버를 삭제할 수 없습니다.'));

      // 요청한 사용자와 삭제 대상 사용자가 다름
      const mockRequest = { user: { id: 2 } };

      // delete 실행 시 UnauthorizedException 발생 여부 확인
      await expect(memberController.delete(1, 2, mockRequest)).rejects.toThrow(UnauthorizedException);
    });

    it('존재하지 않는 멤버 삭제 시 NotFoundException 발생', async () => {
      // MemberService의 delete가 NotFoundException을 반환하도록 설정
      jest.spyOn(memberService, 'delete').mockRejectedValue(new NotFoundException('해당 멤버가 존재하지 않습니다.'));

      const mockRequest = { user: { id: 1 } };

      // delete 실행 시 NotFoundException 발생 여부 확인
      await expect(memberController.delete(1, 99, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });
});
