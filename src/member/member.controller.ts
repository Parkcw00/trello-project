import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Headers,
  Body,
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
  ApiHeader,
} from '@nestjs/swagger';

/**
 * 멤버 관련 API 컨트롤러
 * - 특정 보드(board)에 대한 멤버 관리 기능 제공
 * - 기본 경로: `/board/:boardId/members`
 */
@ApiTags('멤버CRUD') // Swagger에서 '멤버CRUD' 그룹으로 표시
@Controller('board/:boardId/members')
export class MemberController {
  /**
   * 생성자
   * - `MemberService`를 주입받아 멤버 관련 로직 처리
   */
  constructor(private readonly memberService: MemberService) {}

  /**
   * 특정 보드에 속한 모든 멤버 조회 API
   * - `GET /board/:boardId/members`
   * - 특정 보드에 등록된 모든 멤버를 조회
   *
   * @ param boardId - 조회할 보드 ID (URL에서 `:boardId` 값으로 전달됨)
   * @ returns 해당 보드에 속한 멤버 목록과 메시지
   */
  @ApiOperation({
    summary: '멤버 목록 조회',
    description: '특정 보드의 모든 멤버를 조회합니다.',
  })
  @ApiParam({ name: 'boardId', example: 1, description: '조회할 보드 ID' })
  @ApiResponse({ status: 200, description: '멤버 조회 성공' })
  @Get()
  findAll(@Param('boardId') boardId: number) {
    return this.memberService.findAll(boardId);
  }

  /**
   * 특정 보드 내 특정 멤버 상세 조회 API (추가됨)
   * - `GET /board/:boardId/members/:memberId`
   */
  @ApiOperation({
    summary: '멤버 상세 조회',
    description: '특정 보드 내 특정 멤버의 상세 정보를 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer 토큰을 입력하세요',
    required: true,
  })
  @ApiParam({ name: 'boardId', example: 1, description: '보드 ID' })
  @ApiParam({ name: 'memberId', example: 2, description: '조회할 멤버 ID' })
  @ApiResponse({ status: 200, description: '멤버 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '해당 멤버가 존재하지 않습니다.' })
  @Get(':memberId')
  findOne(
    @Param('boardId') boardId: number,
    @Param('memberId') memberId: number,
    @Headers('authorization') authorization: string,
  ) {
    return this.memberService.findOne(boardId, memberId, authorization);
  }

  /**
   * 특정 보드에 멤버 추가 API (중복 방지 기능 추가됨)
   * - `POST /board/:boardId/members`
   * - `Authorization` 헤더에서 JWT 토큰을 받아 인증된 사용자만 실행 가능
   * - 이미 추가된 `userId`가 있으면 `409 Conflict` 에러 발생
   */
  @ApiOperation({
    summary: '멤버 추가 (중복 방지)',
    description:
      '특정 보드에 멤버를 추가합니다. 동일한 userId는 중복 추가 불가.',
  })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer 토큰을 입력하세요',
    required: true,
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
  }) // 🔹 중복 방지 설명 추가
  @ApiResponse({ status: 404, description: '보드 또는 사용자 없음' })
  @Post()
  create(
    @Param('boardId') boardId: number, // URL에서 보드 ID 가져옴
    @Body() createMemberDto: CreateMemberDto, // Body에서 요청 데이터 가져옴
    @Headers('authorization') authorization: string, // 헤더에서 JWT 토큰 가져옴
  ) {
    return this.memberService.create(boardId, createMemberDto, authorization);
  }

  /**
   * 특정 보드에서 멤버 삭제 API
   * - `DELETE /board/:boardId/members/:memberId`
   * - `Authorization` 헤더에서 JWT 토큰을 받아 인증된 사용자만 실행 가능
   *
   * @ param boardId - 멤버가 속한 보드 ID (URL에서 전달됨)
   * @ param memberId - 삭제할 멤버의 ID (URL에서 전달됨)
   * @ param authorization - 요청자의 JWT 토큰 (`Authorization` 헤더에서 전달됨)
   * @ returns 성공 메시지
   */
  @ApiOperation({
    summary: '멤버 삭제',
    description: '특정 보드에서 멤버를 삭제합니다.',
  })
  @ApiBearerAuth() // JWT 인증 필요
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer 토큰을 입력하세요',
    required: true,
  })
  @ApiParam({ name: 'boardId', example: 1, description: '보드 ID' })
  @ApiParam({ name: 'memberId', example: 2, description: '삭제할 멤버 ID' })
  @ApiResponse({ status: 200, description: '멤버 삭제 성공' })
  @ApiResponse({ status: 404, description: '해당 멤버가 존재하지 않습니다.' })
  @Delete(':memberId')
  delete(
    @Param('boardId') boardId: number, // URL에서 보드 ID 가져옴
    @Param('memberId') memberId: number, // URL에서 멤버 ID 가져옴
    @Headers('authorization') authorization: string, // 헤더에서 JWT 토큰 가져옴
  ) {
    return this.memberService.delete(boardId, memberId, authorization);
  }
}
