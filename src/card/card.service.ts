import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';

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
    return await this.cardRepository.save({ columnId, ...createCardDto });
  }

  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
