import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Member } from 'src/member/entities/member.entity';
import { Board } from 'src/board/entities/board.entity';
import { ColumnEntity } from 'src/column/entities/column.entity';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { LexoRank } from 'lexorank';
import { BadRequestException } from '@nestjs/common';

describe('CardService', () => {
  let service: CardService;
  let cardRepository: Repository<Card>;
  let memberRepository: Repository<Member>;
  let boardRepository: Repository<Board>;
  let columnRepository: Repository<ColumnEntity>;

  const mockCardRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
  };

  const mockBoardRepository = {
    findOne: jest.fn(),
  };

  const mockColumnRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        { provide: getRepositoryToken(Card), useValue: mockCardRepository },
        { provide: getRepositoryToken(Member), useValue: mockMemberRepository },
        { provide: getRepositoryToken(Board), useValue: mockBoardRepository },
        {
          provide: getRepositoryToken(ColumnEntity),
          useValue: mockColumnRepository,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    memberRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
    boardRepository = module.get<Repository<Board>>(getRepositoryToken(Board));
    columnRepository = module.get<Repository<ColumnEntity>>(
      getRepositoryToken(ColumnEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCard', () => {
    it('should create a new card', async () => {
      const userId = 1;
      const columnId = 1;
      const createCardDto: CreateCardDto = {
        title: 'New Card',
        content: 'Card Content',
      };

      const column = { id: columnId, board: { id: 99 } };
      const member = { id: 10, userId, boardId: column.board.id };
      const newCard = {
        id: 1,
        columnId,
        content: createCardDto.content,
        lexo: LexoRank.middle().toString(),
        memberId: member.id,
        title: createCardDto.title,
      };

      mockColumnRepository.findOne.mockResolvedValue(column);
      mockMemberRepository.findOne.mockResolvedValue(member);
      mockCardRepository.create.mockReturnValue(newCard);
      mockCardRepository.save.mockResolvedValue(newCard);

      const result = await service.createCard(userId, columnId, createCardDto);
      expect(result).toEqual(newCard);
    });
  });

  describe('findCards', () => {
    it('should return all cards in a column', async () => {
      const userId = 1;
      const columnId = 1;
      const cards = [
        { id: 1, title: 'Card 1', content: 'Content 1', columnId },
        { id: 2, title: 'Card 2', content: 'Content 2', columnId },
      ];

      mockCardRepository.find.mockResolvedValue(cards);

      const result = await service.findCards(userId, columnId);
      expect(result).toEqual(cards);
    });
  });

  describe('findCard', () => {
    it('should return a specific card', async () => {
      const userId = 1;
      const columnId = 1;
      const cardId = 1;
      const card = {
        id: cardId,
        title: 'Card 1',
        content: 'Content 1',
        columnId: 1,
      };

      mockCardRepository.findOne.mockResolvedValue(card);

      const result = await service.findCard(userId, columnId, cardId);
      expect(result).toEqual(card);
    });
  });

  describe('updateCardOrder', () => {
    it('should update card order', async () => {
      const userId = 1;
      const columnId = 1;
      const cardId = 1;
      const targetCardId = 2;

      const column = { id: columnId, board: { id: 99 } };
      const cards = [
        { id: 1, lexo: LexoRank.middle().toString() },
        { id: 2, lexo: LexoRank.middle().genNext().toString() },
      ];
      const targetCard = {
        id: targetCardId,
        lexo: LexoRank.middle().genNext().toString(),
      };

      const updatedCard = {
        id: cardId,
        lexo: LexoRank.parse(targetCard.lexo).genNext().toString(),
      };

      mockColumnRepository.findOne.mockResolvedValue(column);
      mockMemberRepository.findOne.mockResolvedValue({
        boardId: column.board.id,
        userId,
      });
      mockCardRepository.find.mockResolvedValue(cards);

      mockCardRepository.findOne
        .mockResolvedValueOnce(cards[0])
        .mockResolvedValueOnce(targetCard)
        .mockResolvedValueOnce(updatedCard);

      mockCardRepository.update.mockResolvedValue(updatedCard);

      const result = await service.updateCardOrder(
        userId,
        columnId,
        cardId,
        targetCardId,
      );
      expect(result).toEqual(updatedCard);
    });
  });

  // 카드 삭제 테스트
  describe('deleteCard', () => {
    it('카드를 삭제해야 한다.', async () => {
      const userId = 1;
      const cardId = 1;
      const columnId = 1;
      const column = { id: columnId, board: { id: 99 } };

      // 컬럼 조회 Mock
      mockColumnRepository.findOne.mockResolvedValue({
        id: columnId,
        board: { id: 1 },
      });

      // 보드 멤버 조회
      mockMemberRepository.findOne.mockResolvedValue({
        id: 1,
        userId,
        boardId: 1,
      });

      mockCardRepository.delete.mockResolvedValue({ affected: 1 });

      // 카드 삭제 실행
      const result = await service.deleteCard(userId, cardId, columnId);

      expect(mockCardRepository.delete).toHaveBeenCalledWith({
        id: cardId,
        columnId,
      });
    });
  });
});
