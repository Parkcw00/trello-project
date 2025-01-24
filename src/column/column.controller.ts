// import { Roles } from 'src/auth/roles.decorator'; // 권한 데이터 가져오기
// import { RolesGuard } from 'src/auth/roles.guard'; // 권한 검증 가져오기
// import { Role } from 'src/user/types/userRole.type'; // 권한 타입 가져오기

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'; // 컨트롤러 데코레이터 가져오기
import { ColumnService } from './column.service'; // 서비스 가져오기
import { CreateColumnDto } from './dto/create-column.dto'; // 생성 DTO 가져오기
import { UpdateColumnDto } from './dto/update-column.dto'; // 업데이트 DTO 가져오기

@Controller('column') // 컨트롤러 데코레이터 사용
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  // @UseGuards(RolesGuard) // 권한 검증 가져오기 ( 보통 여기서 검증을 진행 )
  @Post()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnService.create(createColumnDto);
  }

  @Get()
  findAll() {
    return this.columnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.columnService.findOne(+id);
  }

  // @Roles(Role.Admin) // 권한 데코레이터를 사용해서 컴럼 이동이 가능한 권한을 가진 사용자만 접근 가능하도록 설정
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.columnService.update(+id, updateColumnDto);
  }

  // @Roles(Role.Admin) // 권한 데코레이터를 사용해서 컴럼 삭제가 가능한 권한을 가진 사용자만 접근 가능하도록 설정
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.columnService.remove(+id);
  }
}
