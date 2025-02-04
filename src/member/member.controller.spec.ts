import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Mock `MemberService`
const mockMemberService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

describe('MemberController', () => {
  let controller: MemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [{ provide: MemberService, useValue: mockMemberService }],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) }) // JWT 인증 무시
      .compile();

    controller = module.get<MemberController>(MemberController);
  });

  describe('findAll', () => {
    it('보드의 모든 멤버를 조회해야 함', async () => {
      const mockMembers = [{ id: 1, userId: 2 }];
      mockMemberService.findAll.mockResolvedValue({ message: '멤버 조회 성공', members: mockMembers });

      const result = await controller.findAll(1);
      expect(result).toEqual({ message: '멤버 조회 성공', members: mockMembers });
      expect(mockMemberService.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('특정 멤버 정보를 조회해야 함', async () => {
      const mockMember = { id: 1, userId: 2 };
      mockMemberService.findOne.mockResolvedValue({ message: '멤버 상세 조회 성공', member: mockMember });

      const result = await controller.findOne(1, 1);
      expect(result).toEqual({ message: '멤버 상세 조회 성공', member: mockMember });
      expect(mockMemberService.findOne).toHaveBeenCalledWith(1, 1);
    });

    it('멤버가 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      mockMemberService.findOne.mockRejectedValue(new NotFoundException('해당 멤버가 존재하지 않습니다.'));

      await expect(controller.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('멤버를 추가하면 성공 메시지를 반환해야 함', async () => {
      const createMemberDto: CreateMemberDto = { userId: 2 };
      mockMemberService.create.mockResolvedValue({ message: '멤버가 추가되었습니다!' });

      const req = { user: { id: 1 } };
      const result = await controller.create(1, createMemberDto, req);

      expect(result).toEqual({ message: '멤버가 추가되었습니다!' });
      expect(mockMemberService.create).toHaveBeenCalledWith(1, createMemberDto, 1);
    });

    it('JWT 인증 실패 시 에러를 던져야 함', async () => {
      const createMemberDto: CreateMemberDto = { userId: 2 };
      const req = { user: null };

      await expect(controller.create(1, createMemberDto, req)).rejects.toThrow(Error);
    });
  });

  describe('delete', () => {
    it('멤버를 삭제하면 성공 메시지를 반환해야 함', async () => {
      mockMemberService.delete.mockResolvedValue({ message: '멤버 삭제 성공' });

      const req = { user: { id: 1 } };
      const result = await controller.delete(1, 1, req);

      expect(result).toEqual({ message: '멤버 삭제 성공' });
      expect(mockMemberService.delete).toHaveBeenCalledWith(1, 1, 1);
    });

    it('JWT 인증 실패 시 에러를 던져야 함', async () => {
      const req = { user: null };

      await expect(controller.delete(1, 1, req)).rejects.toThrow(Error);
    });
  });
});
