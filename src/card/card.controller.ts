import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('카드CRUD')
@Controller('columns/:columnId/cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @ApiOperation({ summary: '카드 생성' })
  @Post()
  create(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() createCardDto: CreateCardDto,
  ): Promise<Card> {
    return this.cardService.createCard(columnId, createCardDto);
  }

  @ApiOperation({ summary: '전체 카드 조회' })
  @Get()
  findCards(
    @Param('columnId', ParseIntPipe) columnId: number,
  ): Promise<Card[]> {
    return this.cardService.findCards(columnId);
  }

  @ApiOperation({ summary: '카드 상세 조회' })
  @Get(':cardId')
  findCard(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<Card> {
    return this.cardService.findCard(columnId, cardId);
  }

  @ApiOperation({ summary: '카드 수정' })
  @Patch(':cardId')
  update(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardService.updateCard(columnId, cardId, updateCardDto);
  }

  @ApiOperation({ summary: '카드 삭제' })
  @Delete(':cardId')
  async deleteCard(
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<{ message: string }> {
    await this.cardService.deleteCard(cardId, columnId);
    return { message: '카드가 삭제되었습니다' };
  }
}
