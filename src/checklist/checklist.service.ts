import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Checklist } from './entities/checklist.entity';
import { Card } from '../card/entities/card.entity';
import { Member } from '../member/entities/member.entity';
import { Repository } from 'typeorm';
import { ChecklistDto } from './dto/checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Checklist)
    private checklistRepository: Repository<Checklist>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  // 이용가능 멤버 확인 메서드
  private async isMember(userId: number, cardId: number) {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['column', 'column.board'],
    });

    if (!card) {
      throw new NotFoundException('카드를 찾을 수 없습니다.');
    }

    const isMember = await this.memberRepository.findOne({
      where: {
        userId,
        boardId: card.column.board.id,
      },
    });

    if (!isMember) {
      throw new ForbiddenException('해당 보드에 대한 접근 권한이 없습니다.');
    }
  }

  // 카드 체크리스트 추가
  async createChecklist(
    userId: number,
    cardId: number,
    checklistDto: ChecklistDto,
  ) {
    await this.isMember(userId, cardId);
    try {
      const { content } = checklistDto;
      await this.checklistRepository.save({
        content,
        cardId,
      });
      return { message: '체크리스트가 추가되었습니다.' };
    } catch (error) {
      throw new BadRequestException('체크리스트 추가에 실패하였습니다.');
    }
  }

  // 카드 체크리스트 조회 (체크리스트 달성여부와 진행도 로직)
  async findChecklist(userId: number, cardId: number) {
    await this.isMember(userId, cardId);
    try {
      let achievementRate: number;
      let achievement: number = 0;

      const checklist = await this.checklistRepository.find({
        where: {
          cardId,
        },
        select: ['content', 'achievement'],
        order: {
          createdAt: 'ASC',
        },
      });

      checklist.forEach((i, j) => {
        i.content = `${j + 1}. ${i.content}`;
        if (i.achievement === true) {
          achievement++;
        }
      });

      if (achievement !== 0) {
        achievementRate = Math.floor((achievement / checklist.length) * 100);
      }

      return achievementRate != null
        ? {
            checklist,
            achievementRate: `${achievementRate}%`,
          }
        : checklist;
    } catch (error) {
      throw new BadRequestException(
        '체크리스트 조회 중 오류가 발생하였습니다.',
      );
    }
  }

  // 카드 체크리스트 내용 수정
  async updateContent(
    userId: number,
    cardId: number,
    checklistId: number,
    checklistDto: ChecklistDto,
  ) {
    await this.isMember(userId, cardId);
    const { content } = checklistDto;
    const checklist = await this.checklistRepository.findOne({
      where: {
        id: checklistId,
        cardId,
      },
    });
    if (!checklist) {
      throw new BadRequestException('해당 체크리스트가 존재하지 않습니다.');
    }

    try {
      await this.checklistRepository.update(checklistId, { content });
      return { message: '체크리스트가 수정되었습니다.' };
    } catch (error) {
      throw new BadRequestException(
        '체크리스트 내용 수정 중 오류가 발생하였습니다.',
      );
    }
  }

  // 카드 체크리스트 목표 달성 여부 수정
  async updateAchievement(userId: number, cardId: number, checklistId: number) {
    await this.isMember(userId, cardId);
    const checklist = await this.checklistRepository.findOne({
      where: {
        id: checklistId,
        cardId,
      },
    });
    if (!checklist) {
      throw new BadRequestException('해당 체크리스트가 존재하지 않습니다.');
    }

    try {
      let trueOrFalse = checklist.achievement === true ? false : true;
      await this.checklistRepository.update(checklistId, {
        achievement: trueOrFalse,
      });
      return {
        message: `체크리스트 달성 여부가 ${trueOrFalse}로 수정 되었습니다.`,
      };
    } catch (error) {
      throw new BadRequestException(
        '체크리스트 달성 여부 수정 중 오류가 발생하였습니다.',
      );
    }
  }

  // 카드 체크리스트 삭제
  async deleteChecklist(userId: number, cardId: number, checklistId: number) {
    await this.isMember(userId, cardId);
    const checklist = await this.checklistRepository.findOne({
      where: {
        id: checklistId,
        cardId,
      },
    });
    if (!checklist) {
      throw new BadRequestException('해당 체크리스트가 존재하지 않습니다.');
    }

    try {
      await this.checklistRepository.delete({
        id: checklistId,
        cardId,
      });
      return { message: `해당 체크리스트가 삭제되었습니다. ` };
    } catch (error) {
      throw new BadRequestException(
        '체크리스트 삭제 중 오류가 발생하였습니다.',
      );
    }
  }
}
