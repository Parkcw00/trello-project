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
    const mockMemberService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const mockAuthGuard = {
      canActivate: jest.fn((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 1 }; // ✅ Mock된 JWT 인증된 사용자
        return true;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: mockMemberService, // ✅ MemberService를 Mock 객체로 주입
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt')) // ✅ `AuthGuard`를 Mock으로 대체
      .useValue(mockAuthGuard)
      .compile();

    memberController = module.get<MemberController>(MemberController);
    memberService = module.get<MemberService>(MemberService);
  });

  /**
   * 멤버 전체 조회 테스트
   */
  describe('findAll', () => {
    it('멤버 목록을 반환해야 함', async () => {
      const mockMembers: Member[] = [{ id: 1, userId: 1, boardId: 1 } as Member];
      jest.spyOn(memberService, 'findAll').mockResolvedValue({
        message: '멤버 조회 성공',
        members: mockMembers,
      });

      const result = await memberController.findAll(1);
      expect(result).toEqual({ message: '멤버 조회 성공', members: mockMembers });
      expect(memberService.findAll).toHaveBeenCalledWith(1);
    });
  });

  /**
   * 특정 멤버 조회 테스트
   */
  describe('findOne', () => {
    it('특정 멤버 정보를 반환해야 함', async () => {
      const mockMember: Member = { id: 2, userId: 3, boardId: 1 } as Member;
      jest.spyOn(memberService, 'findOne').mockResolvedValue({
        message: '멤버 상세 조회 성공',
        member: mockMember,
      });

      const result = await memberController.findOne(1, 2);
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
      jest.spyOn(memberService, 'create').mockResolvedValue({ message: '멤버가 추가되었습니다!' });
  
      // ✅ req.user를 명확하게 포함
      const mockRequest = { user: { id: 1 } };  
  
      const result = await memberController.create(1, dto, mockRequest);
  
      expect(result).toEqual({ message: '멤버가 추가되었습니다!' });
      expect(memberService.create).toHaveBeenCalledWith(1, dto, 1);
    });
  });

  /**
   * 멤버 삭제 테스트
   */
  describe('delete', () => {
    it('멤버 삭제 성공', async () => {
      jest.spyOn(memberService, 'delete').mockResolvedValue({ message: '멤버 삭제 성공' });

      const mockRequest = { user: { id: 1 } }; 
      const result = await memberController.delete(1, 2, mockRequest);

      expect(result).toEqual({ message: '멤버 삭제 성공' });
      expect(memberService.delete).toHaveBeenCalledWith(1, 2, 1);
    });

    it('본인이 아닌 멤버 삭제 시 UnauthorizedException 발생', async () => {
      jest.spyOn(memberService, 'delete').mockRejectedValue(new UnauthorizedException('해당 멤버를 삭제할 수 없습니다.'));

      const mockRequest = { user: { id: 2 } }; 
      await expect(memberController.delete(1, 2, mockRequest)).rejects.toThrow(UnauthorizedException);
    });

    it('존재하지 않는 멤버 삭제 시 NotFoundException 발생', async () => {
      jest.spyOn(memberService, 'delete').mockRejectedValue(new NotFoundException('해당 멤버가 존재하지 않습니다.'));

      const mockRequest = { user: { id: 1 } }; 
      await expect(memberController.delete(1, 99, mockRequest)).rejects.toThrow(NotFoundException);
    });
  });
});
