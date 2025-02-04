import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { User } from 'src/user/entities/user.entity';
import { UpdateCardDto } from './dto/update-card.dto';

describe('CardController', () => {
  let controller: CardController;
  let service: CardService;

  const mockCardService = {
    createCard: jest.fn(),
    findCards: jest.fn(),
    findCard: jest.fn(),
    updateCardOrder: jest.fn(),
    deleteCard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [{ provide: CardService, useValue: mockCardService }],
    }).compile();

    controller = module.get<CardController>(CardController);
    service = module.get<CardService>(CardService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('카드 생성 테스트', async () => {
      const user: User = { id: 1, email: 'asfd1234@naver.com' } as User;
      const columnId = 1;

      const createCardDto: CreateCardDto = {
        title: '카드 제목',
        content: '카드 내용',
      };

      const result = { id: 1, column: 1, title: '카드 제목', position: 1 };

      mockCardService.createCard.mockResolvedValue(result);

      const response = await controller.createCard(
        user,
        columnId,
        createCardDto,
      );

      expect(mockCardService.createCard).toHaveBeenCalledWith(
        1,
        1,
        createCardDto, // 컨트롤러에 리턴값이 3개였으니까 3개 다줘야함!
      );
      expect(response).toEqual(result);
    });
  });

  describe('findCards', () => {
    it('모든 카드를 가져오는 테스트', async () => {
      const user: User = { id: 1, email: 'asfd1234@naver.com' } as User;
      const columnId = 1;
      const cards = [
        { id: 1, title: '첫 번째 카드', content: '내용1' },
        { id: 2, title: '두 번째 카드', content: '내용2' },
      ];

      mockCardService.findCards.mockResolvedValue(cards);

      const response = await controller.findCards(user, columnId);

      expect(mockCardService.findCards).toHaveBeenCalledWith(1, 1);
      expect(response).toEqual(cards);
    });
  });

  describe('findCard', () => {
    it('특정 카드를 가져오는 테스트', async () => {
      const user: User = { id: 1, email: 'asfd1234@naver.com' } as User;
      const columnId = 1;
      const cardId = 1;
      const card = { id: 1, title: '카드 제목', content: '카드 내용' };

      mockCardService.findCard.mockResolvedValue(card);

      const response = await controller.findCard(user, columnId, cardId);

      expect(mockCardService.findCard).toHaveBeenCalledWith(1, 1, 1);
      expect(response).toEqual(card);
    });
  });

  describe('update', () => {
    it('카드를 업데이트하는 테스트', async () => {
      const user: User = { id: 1, email: 'asfd1234@naver.com' } as User;
      const columnId = 1;
      const cardId = 1;
      const targetCardId = 2; // 이동 대상 카드 ID

      const updateCardDto: UpdateCardDto = {
        title: '새로운 제목',
        content: '새로운 내용',
        cardPosition: 1,
      };

      const updatedCard = {
        id: 1,
        title: '새로운 제목',
        content: '새로운 내용',
      };

      mockCardService.updateCardOrder.mockResolvedValue(updatedCard);

      const response = await controller.update(
        user,
        columnId,
        cardId,
        targetCardId,
      );

      expect(mockCardService.updateCardOrder).toHaveBeenCalledWith(1, 1, 1, 2);
      expect(response).toEqual(updatedCard);
    });
  });

  describe('deleteCard', () => {
    it('카드를 삭제하는 테스트', async () => {
      const user: User = { id: 1, email: 'asfd1234@naver.com' } as User;
      const cardId = 1;
      const columnId = 1;

      // 컨트롤러에서 실제 반환하는 값과 일치하도록 수정
      mockCardService.deleteCard.mockResolvedValue({
        message: '카드가 삭제되었습니다',
      });

      const response = await controller.deleteCard(user, columnId, cardId);

      // 호출된 인자 검증
      expect(mockCardService.deleteCard).toHaveBeenCalledWith(1, 1, 1);
      // 반환값이 실제 서비스의 반환값과 일치하는지 확인
      expect(response).toEqual({ message: '카드가 삭제되었습니다' });
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
