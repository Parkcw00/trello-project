import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('멤버CRUD')
@ApiBearerAuth()
@Controller('board/:boardId/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  @ApiOperation({
    summary: '멤버 목록 조회',
    description: '특정 보드의 모든 멤버를 조회합니다.',
  })
  @ApiParam({ name: 'boardId', example: 1, description: '조회할 보드 ID' })
  @ApiResponse({ status: 200, description: '멤버 조회 성공' })
  findAll(@Param('boardId') boardId: number) {
    return this.memberService.findAll(boardId);
  }

  @Get(':memberId')
  @ApiOperation({
    summary: '멤버 상세 조회',
    description: '특정 보드 내 특정 멤버의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'boardId', example: 1, description: '보드 ID' })
  @ApiParam({ name: 'memberId', example: 2, description: '조회할 멤버 ID' })
  @ApiResponse({ status: 200, description: '멤버 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '해당 멤버가 존재하지 않습니다.' })
  findOne(
    @Param('boardId') boardId: number,
    @Param('memberId') memberId: number,
  ) {
    return this.memberService.findOne(boardId, memberId);
  }

  @Post()
  @ApiOperation({
    summary: '멤버 추가',
    description: '특정 보드에 멤버를 추가합니다.',
  })
  @ApiParam({
    name: 'boardId',
    example: 1,
    description: '멤버를 추가할 보드 ID',
  })
  @ApiBody({ type: CreateMemberDto })
  @ApiResponse({ status: 201, description: '멤버가 추가되었습니다!' })
  @ApiResponse({
    status: 409,
    description: '이미 이 보드에 추가된 멤버입니다.',
  })
  create(
    @Param('boardId') boardId: number,
    @Body() createMemberDto: CreateMemberDto,
    @Request() req,
  ) {
    return this.memberService.create(boardId, createMemberDto, req.user.id);
  }

  @Delete(':memberId')
  @ApiOperation({
    summary: '멤버 삭제',
    description: '특정 보드에서 멤버를 삭제합니다.',
  })
  @ApiParam({ name: 'boardId', example: 1, description: '보드 ID' })
  @ApiParam({ name: 'memberId', example: 2, description: '삭제할 멤버 ID' })
  @ApiResponse({ status: 200, description: '멤버 삭제 성공' })
  @ApiResponse({ status: 404, description: '해당 멤버가 존재하지 않습니다.' })
  delete(
    @Param('boardId') boardId: number,
    @Param('memberId') memberId: number,
    @Request() req,
  ) {
    return this.memberService.delete(boardId, memberId, req.user.id);
  }
}
