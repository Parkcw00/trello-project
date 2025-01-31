import { Injectable, BadRequestException } from '@nestjs/common'; // NestJS의 기본 모듈을 가져옵니다.
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Repository } from 'typeorm'; // TypeORM의 Repository를 가져옵니다.
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import _ from 'lodash'; // Lodash 라이브러리를 가져옵니다.

// 카드 서비스를 정의하는 클래스입니다.
@Injectable()
export class CardService {
  // 생성자에서 카드 레포지토리를 주입받습니다.
  constructor(
    @InjectRepository(Card) // Card 엔티티에 대한 레포지토리를 주입합니다.
    private cardRepository: Repository<Card>, // 주입된 레포지토리를 private 변수로 선언합니다.
  ) {}

  // 카드 생성 메서드
  async createCard(
    columnId: number, // 카드가 속할 열의 ID
    createCardDto: CreateCardDto, // 카드 생성에 필요한 데이터
  ): Promise<Card> {
    // 새로운 카드를 생성하고 데이터베이스에 저장한 후, 저장된 카드를 반환합니다.
    return await this.cardRepository.save({ columnId, ...createCardDto });
  }

  // 특정 열에 속한 카드 목록을 찾는 메서드
  async findCards(columnId: number): Promise<Card[]> {
    // 주어진 열 ID에 따라 모든 카드를 조회하여 반환합니다.
    return await this.cardRepository.find({
      where: { columnId }, // 조건: columnId
    });
  }

  // 특정 카드 하나를 찾는 메서드
  async findCard(columnId: number, cardId: number): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, columnId }, // 카드 ID와 열 ID로 카드 조회
    });
    // 카드가 존재하지 않을 경우 예외를 발생시킵니다.
    if (!card) {
      throw new BadRequestException('카드가 존재하지 않습니다.');
    }

    return card; // 카드가 존재하면 반환합니다.
  }

  // 카드 업데이트 메서드
  async updateCard(
    cardId: number, // 수정할 카드의 ID
    columnId: number, // 카드가 속할 열의 ID
    updateCardDto: UpdateCardDto, // 카드 업데이트에 필요한 데이터
  ): Promise<Card> {
    // 카드 정보를 업데이트 합니다.
    await this.cardRepository.update({ id: cardId, columnId }, updateCardDto);
    console.log(cardId, columnId);
    // 업데이트 후, 수정된 카드를 다시 조회하여 반환합니다.
    const card = await this.cardRepository.findOne({
      // findOne 에러만들어주기
      where: { id: cardId, columnId }, // 조건: cardId와 columnId
    });
    if (!cardId) {
      throw new BadRequestException('카드를 찾지 못했습니다');
    }
    return card;
  }

  // 카드 삭제 메서드
  async deleteCard(cardId: number, columnId: number): Promise<void> {
    // 주어진 카드 ID와 열 ID에 해당하는 카드를 삭제합니다.
    const result = await this.cardRepository.delete({
      id: cardId,
      columnId, // 삭제 조건: columnId
    });

    // 삭제된 카드가 없는 경우 예외를 발생시킵니다.
    if (result.affected === 0) {
      throw new BadRequestException('카드를 찾지 못했습니다.');
    }
  }
}
