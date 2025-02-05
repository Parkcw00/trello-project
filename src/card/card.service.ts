import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'; // NestJS의 기본 모듈을 가져옵니다.
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Repository } from 'typeorm'; // TypeORM의 Repository를 가져옵니다.
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Member } from 'src/member/entities/member.entity';
import { Board } from 'src/board/entities/board.entity';
import { LexoRank } from 'lexorank';
import _ from 'lodash';
import { CreateColumnDto } from 'src/column/dto/create-column.dto';
import { ColumnEntity } from 'src/column/entities/column.entity';

// 카드 서비스를 정의하는 클래스입니다.
@Injectable()
export class CardService {
  // 생성자에서 카드 레포지토리를  주입받습니다.
  constructor(
    @InjectRepository(ColumnEntity)
    private columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Card) // Card 엔티티에 대한 레포지토리를 주입합니다.
    private cardRepository: Repository<Card>, // 주입된 레포지토리를 private 변수로 선언합니다.
  ) {}
  async createCard(
    userId: number,
    columnId: number,
    createCardDto: CreateCardDto,
  ) {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });

    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: column.board.id },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '카드을 만들수 있는 권한이 존재하지 않습니다.',
      );
    }

    let lexoRank: LexoRank;
    const existingCard = await this.cardRepository.findOne({
      where: {},
      order: { lexo: 'DESC' },
    });
    if (existingCard && existingCard.lexo) {
      lexoRank = LexoRank.parse(existingCard.lexo.toString()).genNext();
    } else {
      lexoRank = LexoRank.middle();
    }

    const newCard: Card = this.cardRepository.create({
      title: createCardDto.title,
      content: createCardDto.content,
      memberId: checkMember.id, // 멤버아이디
      lexo: lexoRank.toString(),
      columnId: columnId,
    });

    const savedCard = await this.cardRepository.save(newCard);
    return savedCard;
  }

  // 특정 열에 속한 카드 목록을 찾는 메서드

  async findCards(userId: number, columnId: number): Promise<Card[]> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });

    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: column.board.id },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '카드을 조회할 수 있는 권한이 존재하지 않습니다.',
      );
    }

    // 주어진 열 ID에 따라 모든 카드를 조회하여 반환합니다.
    return await this.cardRepository.find({
      where: { columnId }, // 조건: columnId
    });
  }

  // 특정 카드 하나를 찾는 메서드
  async findCard(
    userId: number,
    columnId: number,
    cardId: number,
  ): Promise<Card> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });

    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: column.board.id },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '카드을 조회할 수 있는 권한이 존재하지 않습니다.',
      );
    }

    const card = await this.cardRepository.findOne({
      where: { id: cardId, columnId }, // 카드 ID와 열 ID로 카드 조회
    });
    // 카드가 존재하지 않을 경우 예외를 발생시킵니다.
    if (!card) {
      throw new BadRequestException('카드가 존재하지 않습니다.');
    }

    return card; // 카드가 존재하면 반환합니다.
  }

  async updateCardOrder(
    userId: number,
    columnId: number,
    cardId: number,
    targetCardId: number,
  ): Promise<Card> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });

    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: column.board.id },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '카드을 변경할 수 있는 권한이 존재하지 않습니다.',
      );
    }

    const cards = await this.cardRepository.find({
      where: { columnId },
      order: { lexo: 'DESC' },
    });

    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    const targetCard = await this.cardRepository.findOne({
      where: { id: targetCardId },
    });

    const CardIndex = cards.findIndex((card) => card.id === cardId);
    const targetCardIndex = cards.findIndex((card) => card.id === targetCardId);

    //-------------------------------------------------------------

    if (targetCardIndex < CardIndex) {
      const targetNextCardIndex = targetCardIndex - 1;

      if (!card || !targetCard) {
        throw new BadRequestException('카드가 존재하지 않습니다.');
      }

      const currentRank = LexoRank.parse(card.lexo);
      const targetRank = LexoRank.parse(targetCard.lexo);
      const targetNextCard = cards[targetNextCardIndex];

      if (targetNextCardIndex < 0) {
        let lexoRank: LexoRank;
        lexoRank = LexoRank.parse(targetCard.lexo.toString()).genNext(); // 현재 카드 다음 랭크

        await this.cardRepository.update(
          { id: cardId, columnId },
          { lexo: lexoRank.toString() },
        );

        return await this.cardRepository.findOne({ where: { id: cardId } });
      }
      const newRank = LexoRank.parse(targetNextCard.lexo).between(targetRank); // 현재 카드와 타켓 카드 사이의 랭크

      await this.cardRepository.update(
        { id: cardId, columnId },
        { lexo: newRank.toString() },
      );

      return await this.cardRepository.findOne({ where: { id: cardId } });
    } else {
      const maxIndex: number = cards.length - 1;

      if (targetCardIndex === maxIndex) {
        let lexoRank: LexoRank;
        lexoRank = LexoRank.parse(targetCard.lexo.toString()).genPrev(); // 현재 카드 다음 랭크

        await this.cardRepository.update(
          { id: cardId, columnId },
          { lexo: lexoRank.toString() },
        );

        return await this.cardRepository.findOne({ where: { id: cardId } });
      }

      const targetNextCardIndex = targetCardIndex + 1;

      // const existingCard = await this.cardRepository.findOne({ where: { id: targetCardId }, order: { lexo: "DESC" } })

      if (!card || !targetCard) {
        throw new BadRequestException('카드가 존재하지 않습니다.');
      }

      const currentRank = LexoRank.parse(card.lexo);
      const targetRank = LexoRank.parse(targetCard.lexo);
      const targetNextCard = cards[targetNextCardIndex];

      if (targetNextCardIndex === maxIndex) {
        let lexoRank: LexoRank;
        lexoRank = LexoRank.parse(targetCard.lexo.toString()).genPrev(); // 현재 카드 다음 랭크

        await this.cardRepository.update(
          { id: cardId, columnId },
          { lexo: lexoRank.toString() },
        );

        return await this.cardRepository.findOne({ where: { id: cardId } });
      }
      const newRank = LexoRank.parse(targetNextCard.lexo).between(targetRank); // 현재 카드와 타켓 카드 사이의 랭크

      await this.cardRepository.update(
        { id: cardId, columnId },
        { lexo: newRank.toString() },
      );

      return await this.cardRepository.findOne({ where: { id: cardId } });
    }
    // 카드의 순서 업데이트
  }

  // 카드 삭제 메서드
  async deleteCard(
    userId: number,
    cardId: number,
    columnId: number,
  ): Promise<void> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
      relations: ['board'],
    });

    const checkMember = await this.memberRepository.findOne({
      where: { userId: userId, boardId: column.board.id },
    });

    if (!checkMember) {
      throw new NotFoundException(
        '카드을 삭제할 수 있는 권한이 존재하지 않습니다.',
      );
    }
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
