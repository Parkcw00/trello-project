import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

// 'board/:boardId/members' 경로에서 멤버 관련 API 요청을 처리하는 컨트롤러
@Controller('board/:boardId/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /**
   * 특정 보드에 속한 모든 멤버를 조회하는 API
   * @ param boardId - 조회할 보드의 ID (URL에서 가져옴)
   */
  @Get()
  findAll(@Param('boardId') boardId: number) {
    return this.memberService.findAll(boardId);
  }

  /**
   * 특정 보드 내에서 특정 멤버를 조회하는 API
   * @ param boardId - 멤버가 속한 보드의 ID (URL에서 가져옴)
   * @ param memberId - 조회할 멤버의 ID (URL에서 가져옴)
   */
  @Get(':memberId')
  findOne(@Param('boardId') boardId: number, @Param('memberId') memberId: number) {
    return this.memberService.findOne(boardId, memberId);
  }

  /**
   * 특정 보드에 멤버를 추가하는 API
   * @ param boardId - 멤버를 추가할 보드의 ID (URL에서 가져옴)
   * @ param createMemberDto - { userId } (Body에서 유저 ID를 받음)
   */
  @Post()
  create(@Param('boardId') boardId: number, @Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(boardId, createMemberDto);
  }

  /**
   * 특정 보드에서 특정 멤버를 삭제하는 API
   * @ param boardId - 멤버가 속한 보드의 ID (URL에서 가져옴)
   * @ param memberId - 삭제할 멤버의 ID (URL에서 가져옴)
   */
  @Delete(':memberId')
  delete(@Param('boardId') boardId: number, @Param('memberId') memberId: number) {
    return this.memberService.delete(boardId, memberId);
  }
}
