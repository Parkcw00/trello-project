import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';
import { User } from '../user/entities/user.entity';
import { ChecklistDto } from './dto/checklist.dto';

describe('ChecklistController', () => {
  let controller: ChecklistController;
  let service: ChecklistService;

  const mockChecklistService = {
    createChecklist: jest.fn(),
    findChecklist: jest.fn(),
    updateContent: jest.fn(),
    updateAchievement: jest.fn(),
    deleteChecklist: jest.fn(),
  };

  const mockUser: User = { id: 1 } as User; 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecklistController],
      providers: [
        {
          provide: ChecklistService,
          useValue: mockChecklistService,
        },
      ],
    }).compile();

    controller = module.get<ChecklistController>(ChecklistController);
    service = module.get<ChecklistService>(ChecklistService);
  });

  it('createChecklist', async () => {
    const cardId = 1;
    const checklistDto: ChecklistDto = { content: 'Test Checklist' };
    mockChecklistService.createChecklist.mockResolvedValue({ message: '체크리스트가 추가되었습니다.' });

    const result = await controller.createChecklist(mockUser, cardId, checklistDto);
    
    expect(result).toEqual({ message: '체크리스트가 추가되었습니다.' });
    expect(mockChecklistService.createChecklist).toHaveBeenCalledWith(mockUser.id, cardId, checklistDto);
  });

  it('findChecklist', async () => {
    const cardId = 1;
    const mockChecklist = [{ id: 1, content: 'Test Checklist' }];
    mockChecklistService.findChecklist.mockResolvedValue(mockChecklist);

    const result = await controller.findChecklist(mockUser, cardId);
    
    expect(result).toEqual(mockChecklist);
    expect(mockChecklistService.findChecklist).toHaveBeenCalledWith(mockUser.id, cardId);
  });

  it('updateContent', async () => {
    const cardId = 1;
    const checklistId = 1;
    const checklistDto: ChecklistDto = { content: 'Updated Checklist' };
    mockChecklistService.updateContent.mockResolvedValue({ message: '체크리스트가 수정되었습니다.' });

    const result = await controller.updateContent(mockUser, cardId, checklistId, checklistDto);
    
    expect(result).toEqual({ message: '체크리스트가 수정되었습니다.' });
    expect(mockChecklistService.updateContent).toHaveBeenCalledWith(mockUser.id, cardId, checklistId, checklistDto);
  });

  it('updateAchievement', async () => {
    const cardId = 1;
    const checklistId = 1;
    mockChecklistService.updateAchievement.mockResolvedValue({ message: '체크리스트 목표가 수정되었습니다.' });

    const result = await controller.updateAchievement(mockUser, cardId, checklistId);
    
    expect(result).toEqual({ message: '체크리스트 목표가 수정되었습니다.' });
    expect(mockChecklistService.updateAchievement).toHaveBeenCalledWith(mockUser.id, cardId, checklistId);
  });

  it('deleteChecklist', async () => {
    const cardId = 1;
    const checklistId = 1;
    mockChecklistService.deleteChecklist.mockResolvedValue({ message: '체크리스트가 삭제되었습니다.' });

    const result = await controller.deleteChecklist(mockUser, cardId, checklistId);
    
    expect(result).toEqual({ message: '체크리스트가 삭제되었습니다.' });
    expect(mockChecklistService.deleteChecklist).toHaveBeenCalledWith(mockUser.id, cardId, checklistId);
  });
});