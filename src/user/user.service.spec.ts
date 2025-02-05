import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

// bcrypt 전체를 모킹
jest.mock('bcrypt', () => ({// bcrypt.compare()는 단순히 password123과 비교하여 결과 반환.
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  // bcrypt.compare()를 async 함수로 모킹하여 await 사용 가능
  compare: jest.fn().mockImplementation(async (pass, hashedPass) => pass === 'password123'),
}));

// UserService에 대한 테스트 블록을 정의.
// 첫 번째 인자는 테스트그룹 명칭 문자열, 두 번째 인자는 해당 그룹에서 실행해야할 텟스트 케이스를 정의한 함수
describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;
  //let hashSpy: jest.SpyInstance;
 // let compareSpy: jest.SpyInstance;
  beforeEach(async () => {
    // 특정 테스트마다 따로 spyOn()을 호출하는 것이 아니라, beforeEach()에서 한 번만 설정하고 테스트마다 재사용하는 방법
   // hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(async () =>'hashedPassword');
  //  compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(async () =>true);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        JwtService,
        ConfigService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

    afterEach(() => {
      jest.restoreAllMocks();  // 모든 mock을 원래 상태로 복구
    });
  
  
  describe('create', () => {
    // 성공 케이스
    it('회원가입 성공', async () => {
      const createUserDto: CreateUserDto = {        
        email: 'test@example.com',
        name:'테스트 유저',
        password: 'password123',
        verifyPassword: 'password123',
      };


      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // 비번 해싱 : $2b$10$66AmhdfbUrcY67RWnq3szulaWmjUEwP8cuZ0otnh5BU/M7S5aEW2G
     //jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword')
 //  jest.spyOn(bcrypt, 'hash').mockImplementation(async () =>'hashedPassword')
   
      jest.spyOn(userRepository, 'create').mockReturnValue(createUserDto as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(createUserDto as any);

      const result = await userService.create(createUserDto);

      // userService.create()를 실행
      expect(result).toEqual({
        message: '회원가입이 완료되었습니다.',
        email: 'test@example.com',
      });
    });
  });

  describe('login', () => {
    it('로그인 성공', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');

      const result = await userService.login(loginUserDto);

      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockAccessToken',
      });
    });
  });

  describe('remove', () => {
    it('회원 탈퇴 성공', async () => {
      const deleteUserDto = { password: 'password123' };
      const userPayload = { id: 1 };

      const mockUser = {
        id: 1,
        password: 'hashedPassword',
      deletedAt: null, // 처음에는 삭제되지 않은 상태
      };

          // findOne이 처음에는 기존 유저를 반환해야 함
    jest.spyOn(userRepository, 'findOne')
    .mockResolvedValueOnce(mockUser as User)  // 삭제 전 유저 데이터
    .mockResolvedValueOnce({ ...mockUser, deletedAt: new Date() } as User); // 삭제 후 데이터

  jest.spyOn(userRepository, 'softDelete')
    .mockResolvedValue({ affected: 1 } as any);

  const result = await userService.remove(deleteUserDto, userPayload);

  expect(result).toEqual({ message: '회원 탈퇴가 완료되었습니다.' });
});

   
  });
});
