import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards, // 인증을 위한 데코레이터
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
import { AuthGuard } from '@nestjs/passport'; // JWT 인증을 위한 가드 적용

/**
 * 멤버 관리 컨트롤러
 * - 특정 보드 내 멤버 추가, 조회, 삭제 기능을 제공
 * - JWT 인증을 적용하여 인증된 사용자만 멤버 관리 가능
 */
@ApiTags('멤버CRUD') // Swagger에서 API 그룹을 '멤버CRUD'로 표시
@ApiBearerAuth() // Swagger에서 JWT 인증 헤더 추가
@Controller('board/:boardId/members') // 엔드포인트 설정
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /**
   * 특정 보드의 모든 멤버 조회
   * @param boardId 조회할 보드의 ID
   * @returns 해당 보드의 모든 멤버 목록과 메시지
   */
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

  /**
   * 특정 보드 내 특정 멤버의 상세 조회
   * param boardId 보드 ID
   * param memberId 조회할 멤버 ID
   * returns 해당 멤버의 상세 정보
   */
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

  /**
   * 특정 보드에 멤버 추가
   * - JWT 인증이 필요하며, 인증된 사용자의 요청만 허용됨
   * - 중복된 userId 추가 방지
   *
   * param boardId 멤버를 추가할 보드 ID
   * param createMemberDto 추가할 멤버 정보 (userId 필수)
   * param req JWT 인증된 사용자 정보
   * returns 성공 메시지
   */
  @Post()
  @UseGuards(AuthGuard('jwt')) // JWT 인증 적용
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
    // console.log('[POST] 멤버 추가 요청:', { userId: req.user?.id });

    // JWT 인증이 실패하면 예외를 던진다
    if (!req?.user?.id) {
      throw new Error('JWT 인증 실패: 사용자 정보를 가져올 수 없습니다.');
    }

    return this.memberService.create(boardId, createMemberDto, req.user.id);
  }

  /**
   * 특정 보드에서 멤버 삭제
   * - JWT 인증이 필요하며, 본인만 삭제 가능
   *
   * param boardId 보드 ID
   * param memberId 삭제할 멤버 ID
   * param req JWT 인증된 사용자 정보
   * returns 성공 메시지
   */
  @Delete(':memberId')
  @UseGuards(AuthGuard('jwt')) // JWT 인증 적용
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
    console.log('[DELETE] 멤버 삭제 요청:', { userId: req.user?.id });

    // JWT 인증이 실패하면 예외를 던진다
    if (!req?.user?.id) {
      throw new Error('JWT 인증 실패: 사용자 정보를 가져올 수 없습니다.');
    }

    return this.memberService.delete(boardId, memberId, req.user.id);
  }
}
