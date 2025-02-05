import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findMe: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call userService.create and return created user', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com', password: '123456',
        name: '게장 비빔밥',
        verifyPassword: '123456'
      };
      const result = { message: "회원가입이 완료되었습니다.", email: "test@test.com" }
  
      jest.spyOn(userService, 'create').mockResolvedValue(result);
      expect(await userController.signUp(dto)).toEqual(result);
      expect(userService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should call userService.login and return token', async () => {
      const dto: LoginUserDto = { email: 'test@test.com', password: '123456' };
      const result = { accessToken: "mockAccessToken", refreshToken: "mockRefreshToken" }
      jest.spyOn(userService, 'login').mockResolvedValue(result);
      
      expect(await userController.login(dto)).toEqual(result);
      expect(userService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('refreshAccessToken', () => {
    it('should call userService.refreshToken and return new token', async () => {
      const token = 'Bearer refreshToken123';
      const newToken = { accessToken: 'newToken' };
      jest.spyOn(userService, 'refreshToken').mockResolvedValue(newToken);

      expect(await userController.refreshAccessToken(token)).toEqual(newToken);
      expect(userService.refreshToken).toHaveBeenCalledWith('refreshToken123');
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      await expect(userController.refreshAccessToken('invalidToken')).rejects.toThrowError();
    });
  });

  describe('logout', () => {
    it('should call userService.logout and return success message', async () => {
      const req = { user: { id: 1, email: 'test@test.com' } };
      const result = {
        message: "로그아웃이 성공적으로 완료되었습니다.",
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken"
      };
     
    //  jest.spyOn(userService, 'logout').mockResolvedValue({ success: true });
 jest.spyOn(userService, 'logout').mockResolvedValue(result);

 
      expect(await userController.logout(req)).toEqual(result);
      expect(userService.logout).toHaveBeenCalledWith(req.user);
    });
  });

  describe('users', () => {
    it('should return an array of users', async () => {
      const users =  [
        {
          id: 1,
          email: "test@test.com",
          name: "Test User",
          password: "hashedpassword",
          board: [],
          member: [],
          createAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];;
      // jest.spyOn(userService, 'findAll').mockResolvedValue(users);
      jest.spyOn(userService, 'findAll').mockResolvedValue(users);      
      expect(await userController.users()).toEqual(users);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });
/*
  describe('getUserInfo', () => {
    it('should return user info', async () => {
      const user = { id: 1, email: 'test@test.com' };      
      //jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(userService, 'findOne').mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedpassword', // 추가
        createAt: expect.any(Date),      // 추가
        updatedAt: expect.any(Date),      // 추가
        deletedAt: null,            // 추가 (Soft Delete가 있을 경우)
        member: [],                 // 추가
        board: [],                  // 추가
      });
      
      
      expect(await userController.getUserInfo('1', {})).toEqual(user);
      expect(userService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getMyInfo', () => {
    it('should return current user info', async () => {
      const req = { user: { id: 1, email: 'test@test.com' } };
      // jest.spyOn(userService, 'findMe').mockResolvedValue(req.user);
      jest.spyOn(userService, 'findMe').mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashedpassword',
        createAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,  // Soft delete 사용 시 null 처리
        member: [],       // 관계된 데이터가 있을 경우 빈 배열 설정
        board: [],        // 관계된 데이터가 있을 경우 빈 배열 설정
      });
      
      expect(await userController.getMyInfo(req)).toEqual(req.user);
      expect(userService.findMe).toHaveBeenCalledWith(req.user);
    });
  });
*/

describe('getUserInfo', () => {
  it('should return user info', async () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@test.com',      
      password: 'hashedpassword',
      createAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
      member: [],
      board: [],
    };

    jest.spyOn(userService, 'findOne').mockResolvedValue(user); 

    const result = await userController.getUserInfo('1', {});
    expect(result).toEqual(user);  // password 없이 검증
    expect(userService.findOne).toHaveBeenCalledWith(1);
  });
});


describe('getMyInfo', () => {
  it('should return current user info', async () => {
    const req = { user: { id: 1, email: 'test@test.com' } };
    const userInfo = {
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
      password: 'hashedpassword',
      createAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
      member: [],
      board: [],
    };

    jest.spyOn(userService, 'findMe').mockResolvedValue(userInfo);

    const result = await userController.getMyInfo(req);
    expect(result).toEqual(userInfo);  // password 제외한 정보만 검증
    expect(userService.findMe).toHaveBeenCalledWith(req.user);
  });
});



  describe('updateUser', () => {
    it('should update user info', async () => {
      const dto: UpdateUserDto = { name: 'newName',newPassword:'11111', password:'123456' };
      const req = { user: { id: 1 } };
      const updatedUser ={
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        newUser: { id: 1, name: 'newName',
          email: 'test@test.com', 
          password:'11111',
          createAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deletedAt: null,
          member: [],
          board: [],  }
      }
      
      // jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);
      jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);
      
      //expect(await userController.updateUser(dto, req)).toEqual(updatedUser);
      expect(await userController.updateUser(dto, req)).toEqual(updatedUser);

      
      expect(userService.update).toHaveBeenCalledWith(dto, req.user);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const dto: DeleteUserDto = { password: '123456' };
      const req = { user: { id: 1 } };
     // jest.spyOn(userService, 'remove').mockResolvedValue({ success: true });
     jest.spyOn(userService, 'remove').mockResolvedValue({
      message: '회원 탈퇴 성공',
    });
      //expect(await userController.deleteUser(dto, req)).toEqual({ success: true });
      expect(await userController.deleteUser(dto, req)).toEqual({ message: '회원 탈퇴 성공' });

      expect(userService.remove).toHaveBeenCalledWith(dto, req.user);
    });
  });
});
