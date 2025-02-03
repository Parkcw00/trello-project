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

@ApiTags('카드CRUD')
@ApiBearerAuth()
@Controller('columns/:columnId/cards')
@UseGuards(AuthGuard('jwt'))
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @ApiOperation({ summary: '카드 생성' })
  @Post()
  createCard(
    @Req() req: Request,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Body() createCardDto: CreateCardDto,
  ): Promise<Card> {
    return this.cardService.createCard(columnId, createCardDto);
  }

  @ApiOperation({ summary: '전체 카드 조회' })
  @Get()
  findCards(
    @Req() req: Request,
    @Param('columnId', ParseIntPipe) columnId: number,
  ): Promise<Card[]> {
    return this.cardService.findCards(columnId);
  }

  @ApiOperation({ summary: '카드 상세 조회' })
  @Get(':cardId')
  findCard(
    @Req() req: Request,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<Card> {
    return this.cardService.findCard(columnId, cardId);
  }

  @ApiOperation({ summary: '카드 수정' })
  @Patch(':cardId/:targetCardId')
  update(
    @Req() req: Request,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('targetCardId', ParseIntPipe) targetCardId: number,
    // @Body() updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    return this.cardService.updateCardOrder(columnId, cardId, targetCardId);
  }

  @ApiOperation({ summary: '카드 삭제' })
  @Delete(':cardId')
  async deleteCard(
    @Req() req: Request,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ): Promise<{ message: string }> {
    await this.cardService.deleteCard(cardId, columnId);
    return { message: '카드가 삭제되었습니다' };
  }
}

// 미들웨어를 거쳐서 req.user로 받아오도록
