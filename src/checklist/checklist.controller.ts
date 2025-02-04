import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { ChecklistService } from './checklist.service';
import { ChecklistDto } from './dto/checklist.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('cards/:id/checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  // 카드 체크리스트 추가
  @Post('')
  async createChecklist(
    @UserInfo() user: User,
    @Param('id') cardId: number,
    @Body() checklistDto: ChecklistDto,
  ) {
    return await this.checklistService.createChecklist(
      user.id,
      cardId,
      checklistDto,
    );
  }

  // 카드 체크리스트 조회
  @Get('')
  async findChecklist(@UserInfo() user: User, @Param('id') cardId: number) {
    return await this.checklistService.findChecklist(
      user.id,
      cardId,
    );
  }

  // 카드 체크리스트 내용 수정
  @Patch(':checklistId')
  async updateContent(
    @UserInfo() user: User,
    @Param('id') cardId: number,
    @Param('checklistId') checklistId: number,
    @Body() checklistDto: ChecklistDto,
  ) {
    return await this.checklistService.updateContent(
      user.id,
      cardId,
      checklistId,
      checklistDto,
    );
  }

  // 카드 체크리스트 목표 달성 여부 수정
  @Patch(':checklistId/achieve')
  async updateAchievement(
    @UserInfo() user: User,
    @Param('id') cardId: number,
    @Param('checklistId') checklistId: number,
  ) {
    return await this.checklistService.updateAchievement(
      user.id,
      cardId,
      checklistId,
    );
  }

  // 카드 체크리스트 삭제
  @Delete(':checklistId')
  async deleteChecklist(
    @UserInfo() user: User,
    @Param('id') cardId: number,
    @Param('checklistId') checklistId: number,
  ) {
    return await this.checklistService.deleteChecklist(
      user.id,
      cardId,
      checklistId,
    );
  }
}
