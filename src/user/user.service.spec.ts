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


// UserService에 대한 테스트 블록을 정의.
// 첫 번째 인자는 테스트그룹 명칭 문자열, 두 번째 인자는 해당 그룹에서 실행해야할 텟스트 케이스를 정의한 함수
describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
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

  describe('create', () => {
    // 성공 케이스
    it('회원가입 성공', async () => {
      const createUserDto: CreateUserDto = {
        password: 'password123',
        name:'가제는 게편 랍스타볶음밥',
        email: 'test@example.com',
        verifyPassword: 'password123',
      };


      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      // 비번 해싱 : $2b$10$66AmhdfbUrcY67RWnq3szulaWmjUEwP8cuZ0otnh5BU/M7S5aEW2G
     //jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword')
   jest.spyOn(bcrypt, 'hash').mockImplementation(async () =>'hashedPassword')
   
      jest.spyOn(userRepository, 'create').mockReturnValue(createUserDto as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(createUserDto as any);

      const result = await userService.create(createUserDto);

      // userService.create()를 실행
      expect(result).toEqual({
        message: '회원가입이 완료되었습니다.',
        email: 'test@example.com',
      });
    });

    it('비밀번호 불일치 예외 발생', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',        
        name:'가제는 게편 랍스타볶음밥',
        password: 'password123',
        verifyPassword: 'differentPassword',
      };

      await expect(userService.create(createUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('이미 존재하는 이메일로 회원가입 시 ConflictException 발생', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',        
        name:'가제는 게편 랍스타볶음밥',
        password: 'password123',
        verifyPassword: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({} as User);

      await expect(userService.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
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
        jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');

      const result = await userService.login(loginUserDto);

      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockAccessToken',
      });
    });

    it('이메일이 존재하지 않을 경우 NotFoundException 발생', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        userService.login({ email: 'notfound@example.com', password: '1234' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('비밀번호가 틀릴 경우 UnauthorizedException 발생', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        userService.login({ email: 'test@example.com', password: 'wrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    it('유저 정보 조회 성공', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await userService.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 유저 ID 조회 시 NotFoundException 발생', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('회원 탈퇴 성공', async () => {
      const deleteUserDto = { password: 'password123' };
      const userPayload = { id: 1 };

      const mockUser = {
        id: 1,
        password: 'hashedPassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(userRepository, 'softDelete').mockResolvedValue({ affected: 1 } as any);

      const result = await userService.remove(deleteUserDto, userPayload);

      expect(result).toEqual({ message: '회원 탈퇴가 완료되었습니다.' });
    });

    it('비밀번호가 틀릴 경우 UnauthorizedException 발생', async () => {
      const deleteUserDto = { password: 'wrongPassword' };
      const userPayload = { id: 1 };

      const mockUser = {
        id: 1,
        password: 'hashedPassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      // jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      // mockResolvedValue(false) 대신 mockImplementation(async () => false)을 사용하면 TypeScript가 Promise<boolean> 타입을 올바르게 추론한다.
     jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);


      await expect(userService.remove(deleteUserDto, userPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('존재하지 않는 유저 삭제 시 NotFoundException 발생', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.remove({ password: '1234' }, { id: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
