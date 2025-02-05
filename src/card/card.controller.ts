import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('카드CRUD')
@ApiBearerAuth()
@Controller('columns/:columnId/cards')
@UseGuards(AuthGuard('jwt'))
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @ApiOperation({ summary: '카드 생성' })
  @Post()
  createCard(
    @UserInfo() user: User,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() createCardDto: CreateCardDto,
  ): Promise<Card> {
    return this.cardService.createCard(user.id, columnId, createCardDto);
  }

  @ApiOperation({ summary: '전체 카드 조회' })
  @Get()
  findCards(
    @UserInfo() user: User,
    @Param('columnId', ParseIntPipe) columnId: number,
  ): Promise<Card[]> {
    return this.cardService.findCards(user.id, columnId);
  }

  @ApiOperation({ summary: '카드 상세 조회' })
  @Get(':cardId')
  findCard(
    @UserInfo() user: User,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<Card> {
    return this.cardService.findCard(user.id, columnId, cardId);
  }

  @ApiOperation({ summary: '카드 수정' })
  @Patch(':cardId/:targetCardId')
  update(
    @UserInfo() user: User,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('targetCardId', ParseIntPipe) targetCardId: number,
    // @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardService.updateCardOrder(
      user.id,
      columnId,
      cardId,
      targetCardId,
    );
  }

  @ApiOperation({ summary: '카드 삭제' })
  @Delete(':cardId')
  async deleteCard(
    @UserInfo() user: User,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<{ message: string }> {
    await this.cardService.deleteCard(user.id, cardId, columnId);
    return { message: '카드가 삭제되었습니다' };
  }
}
