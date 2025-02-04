import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { User } from 'src/user/entities/user.entity';

describe('CardController', () => {
  let controller: CardController;
  let service: CardService;

  const mockCardService = {
    createCard: jest.fn(),
    findCards: jest.fn(),
    findCard: jest.fn(),
    updateCard: jest.fn(),
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
