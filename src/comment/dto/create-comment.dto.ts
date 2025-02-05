import { PickType } from '@nestjs/mapped-types'; // 타입 가져오기

import { Comment } from '../entities/comment.entity';
import { IsNumber, IsString } from 'class-validator'; // 데코레이터 가져오기
import { ApiProperty } from '@nestjs/swagger';
import { TestingModule, Test } from '@nestjs/testing';
import { CardController } from 'src/card/card.controller';
import { CardService } from 'src/card/card.service';

export class CreateCommentDto extends PickType(Comment, [
  'content',
  'cardId',
  'memberId',
]) {
  @ApiProperty({ example: '오혜성 바보' })
  @IsString() // 데코레이터 사용 ( 문자열 타입 )
  content: string;
}

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
    it('리스트 생성 테스트', async () => {
      const createListDto: CreateCardDto = {
        boardId: 1,
        title: 'New List',
      };

      const result = { id: 1, boardId: 1, title: 'New List', position: 1 };

      mockCardService.create.mockResolvedValue(result);

      const response = await controller.create(createListDto);

      expect(service.create).toHaveBeenCalledWith(createListDto);
      expect(response).toEqual(result);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
