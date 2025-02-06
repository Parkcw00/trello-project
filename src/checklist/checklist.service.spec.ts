import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistService } from './checklist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Checklist } from './entities/checklist.entity';
import { Card } from '../card/entities/card.entity';
import { Member } from '../member/entities/member.entity';
import { Repository } from 'typeorm';
import { ChecklistDto } from './dto/checklist.dto';

describe('ChecklistService', () => {
  let service: ChecklistService;
  let checklistRepository: Repository<Checklist>;
  let memberRepository: Repository<Member>;
  let cardRepository: Repository<Card>;

  const mockChecklistRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
  };

  const mockCardRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistService,
        {
          provide: getRepositoryToken(Checklist),
          useValue: mockChecklistRepository,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
      ],
    }).compile();

    service = module.get<ChecklistService>(ChecklistService);
    checklistRepository = module.get<Repository<Checklist>>(
      getRepositoryToken(Checklist),
    );
    memberRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
  });

  describe('createChecklist', () => {
    it('createChecklist', async () => {
      const userId = 1;
      const cardId = 1;
      const checklistDto: ChecklistDto = { content: 'Test Checklist' };

      mockCardRepository.findOne.mockResolvedValueOnce({
        id: cardId,
        column: { board: { id: 1 } },
      });
      mockMemberRepository.findOne.mockResolvedValueOnce({
        userId,
        boardId: 1,
      });
      mockChecklistRepository.save.mockResolvedValueOnce(undefined);

      const result = await service.createChecklist(
        userId,
        cardId,
        checklistDto,
      );
      expect(result).toEqual({ message: '체크리스트가 추가되었습니다.' });
      expect(mockChecklistRepository.save).toHaveBeenCalledWith({
        content: 'Test Checklist',
        cardId,
      });
    });
  });

  describe('findChecklist', () => {
    it('findChecklist', async () => {
      const userId = 1;
      const cardId = 1;

      mockCardRepository.findOne.mockResolvedValueOnce({
        id: cardId,
        column: { board: { id: 1 } },
      });
      mockMemberRepository.findOne.mockResolvedValueOnce({
        userId,
        boardId: 1,
      });
      mockChecklistRepository.find.mockResolvedValueOnce([
        { content: 'Test Checklist 1', achievement: true },
        { content: 'Test Checklist 2', achievement: false },
      ]);

      const result = await service.findChecklist(userId, cardId);
      expect(result).toEqual({
        checklist: [
          { content: '1. Test Checklist 1', achievement: true },
          { content: '2. Test Checklist 2', achievement: false },
        ],
        achievementRate: '50%',
      });
    });
  });

  describe('updateContent', () => {
    it('updateContent', async () => {
      const userId = 1;
      const cardId = 1;
      const checklistId = 1;
      const checklistDto: ChecklistDto = { content: 'Updated Test Checklist' };

      mockCardRepository.findOne.mockResolvedValueOnce({
        id: cardId,
        column: { board: { id: 1 } },
      });
      mockMemberRepository.findOne.mockResolvedValueOnce({
        userId,
        boardId: 1,
      });
      mockChecklistRepository.findOne.mockResolvedValueOnce({
        id: checklistId,
        cardId,
      });
      mockChecklistRepository.update.mockResolvedValueOnce(undefined);
      const result = await service.updateContent(
        userId,
        cardId,
        checklistId,
        checklistDto,
      );
      expect(result).toEqual({ message: '체크리스트가 수정되었습니다.' });
      expect(mockChecklistRepository.update).toHaveBeenCalledWith(checklistId, {
        content: 'Updated Test Checklist',
      });
    });
  });

  describe('updateAchievements', () => {
    it('updateAchievements', async () => {
      const userId = 1;
      const cardId = 1;
      const checklistId = 1;

      mockCardRepository.findOne.mockResolvedValueOnce({
        id: cardId,
        column: { board: { id: 1 } },
      });
      mockMemberRepository.findOne.mockResolvedValueOnce({
        userId,
        boardId: 1,
      });
      mockChecklistRepository.findOne.mockResolvedValueOnce({
        id: checklistId,
        cardId,
        achievement: true,
      });
      mockChecklistRepository.update.mockResolvedValueOnce(undefined);

      const result = await service.updateAchievement(
        userId,
        cardId,
        checklistId,
      );
      expect(result).toEqual({
        message: `체크리스트 달성 여부가 false로 수정 되었습니다.`,
      });
    });
  });

  describe('deleteChecklist', () => {
    it('deleteChecklist', async () => {
      const userId = 1;
      const cardId = 1;
      const checklistId = 1;

      mockCardRepository.findOne.mockResolvedValueOnce({
        id: cardId,
        column: { board: { id: 1 } },
      });
      mockMemberRepository.findOne.mockResolvedValueOnce({
        userId,
        boardId: 1,
      });
      mockChecklistRepository.findOne.mockResolvedValueOnce({
        id: checklistId,
        cardId,
      });
      mockChecklistRepository.delete.mockResolvedValueOnce(undefined);

      const result = await service.deleteChecklist(userId, cardId, checklistId);
      expect(result).toEqual({message: `해당 체크리스트가 삭제되었습니다. `})
      expect(mockChecklistRepository.delete).toHaveBeenCalledWith({
        id: checklistId,
        cardId,
      })
    });
  });
});
