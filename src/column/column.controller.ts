// import { Roles } from 'src/auth/roles.decorator'; // 권한 데이터 가져오기
// import { RolesGuard } from 'src/auth/roles.guard'; // 권한 검증 가져오기
// import { Role } from 'src/user/types/userRole.type'; // 권한 타입 가져오기

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Headers, UseGuards } from '@nestjs/common'; // 컨트롤러 데코레이터 가져오기
import { ColumnService } from './column.service'; // 서비스 가져오기
import { CreateColumnDto } from './dto/create-column.dto'; // 생성 DTO 가져오기
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ColumnEntity } from './entities/column.entity';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from './../utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@ApiTags('컬럼CRUD')
@Controller('board/:boardId/column') // 컨트롤러 데코레이터 사용
export class ColumnController { // 컨트롤러 클래스
  constructor(private readonly columnService: ColumnService) {} // 생성자 메서드

  @ApiOperation({ summary: '컬럼 생성' })
  @Post()
  create(
    @UserInfo() user: User, 
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() createColumnDto: CreateColumnDto
  ){ // 컬럼 생성 메서드 (바디에서 받은 데이터를 이용해서 생성 메서드를 만듬)
    return this.columnService.create(user.id, boardId, createColumnDto ); // 컬럼 생성 메서드를 이용해서 컬럼 데이터를 생성
  }

  @ApiOperation({ summary: '보드안에 있는 모든 컬럼 조회' })
  @Get() // 모든 컬럼 조회 메서드
  findAll(
    @UserInfo() user: User,
    @Param('boardId', ParseIntPipe) boardId: number
  ) {
    return this.columnService.findAll(boardId, user.id); // 컬럼 서비스를 이용해서 모든 컬럼 데이터를 조회
  }

  @ApiOperation({ summary: '특정 컬럼 조회' })
  @Get(':columnId')
  findOne(
    @Param('columnId', ParseIntPipe) columnId: number,
    @UserInfo() user: User, 

    @Param('boardId', ParseIntPipe) boardId: number) { // 특정 컬럼 조회 메서드

    return this.columnService.findOne(columnId, user.id, boardId); // 컬럼 서비스를 이용해서 특정 컬럼 데이터를 조회
  }


  // @Roles(Role.Admin) // 권한 데코레이터를 사용해서 컴럼 이동이 가능한 권한을 가진 사용자만 접근 가능하도록 설정
  @ApiOperation({ summary: '컬럼 순서 업데이트' })
  @Patch(':boardId/:columnId/:targetColumnId')
  update(
    @Param('boardId', ParseIntPipe) boardId: number, 
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('targetColumnId', ParseIntPipe) targetColumnId: number,
    @UserInfo() user: User
  ): Promise<ColumnEntity> {
    return this.columnService.updateColumnOrder(boardId, columnId, targetColumnId, user.id); // 컬럼 서비스를 이용해서 특정 컬럼 데이터를 업데이트
  }


  @ApiOperation({ summary: '컬럼 삭제' })
  @Delete(':columnId')
  remove(
    @Param('columnId', ParseIntPipe) columnId: number, 
    @UserInfo() user: User, 
    @Param('boardId', ParseIntPipe) boardId: number) { // 컬럼 삭제 메서드
    return this.columnService.delete(columnId, user.id, boardId); // 컬럼 서비스를 이용해서 특정 컬럼 데이터를 삭제
  }

}
