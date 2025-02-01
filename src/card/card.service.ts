import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { LexoRank } from 'lexorank';
import _ from 'lodash';

// 카드가 만들어지는데에 필요한 정보를 정해준다
// 타입 orm을 써서 DB에 저장한다 (받아온 정보로 카드를 만든다)
// 저장한 정보를 리턴한다

@Injectable()
export class CardService {
  // 컨스트럭터 작성
  // 컨스트럭터 안에 레포지토리 연결하기
  // 크리에이트 매서드 생성
  // 파람스 해서 타입지정?

  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}
  async createCard(columnId: number, createCardDto: CreateCardDto) {
    let lexoRank: LexoRank;
    const existingCard = await this.cardRepository.findOne({ where: {}, order: { lexo: "DESC" } })
    if (existingCard && existingCard.lexo) {
      lexoRank = LexoRank.parse(existingCard.lexo.toString()).genNext();
    } else {
      lexoRank = LexoRank.middle();
    }
  
    const newCard: Card = this.cardRepository.create({
      title: createCardDto.title,
      content: createCardDto.content,
      lexo: lexoRank.toString()
    });
  
    const savedCard = await this.cardRepository.save(newCard);
    return savedCard;
  }

  async findCards(columnId: number): Promise<Card[]> {
    return await this.cardRepository.find({
      where: { columnId },
    });
  }

  async findCard(columnId: number, cardId: number): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, columnId },
    });
    if (!card) {
      throw new BadRequestException('카드가 존재하지 않습니다.');
    }

    return card;
  }

  async updateCard(
    cardId: number,
    columnId: number,
    updateCardDto: UpdateCardDto,
  ): Promise<Card> {
    await this.cardRepository.update({ id: cardId, columnId }, updateCardDto);
    return await this.cardRepository.findOne({
      where: { id: cardId, columnId },
    });
  }

  async deleteCard(cardId: number, columnId: number): Promise<void> {
    const result = await this.cardRepository.delete({
      id: cardId,
      columnId,
    });

    if (result.affected === 0) {
      throw new BadRequestException('카드를 찾지 못했습니다.');
    }
  }
}
