import _ from 'lodash';
import { Repository } from 'typeorm';
import {Controller, Get, Headers,
  ConflictException, Injectable, NotFoundException, UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import{CreateUserDto, LoginUserDto, UpdateUserDto,DeleteUserDto}from './dto/user.dto'
import { User } from './entities/user.entity';

// 비번 암호화해서 저장하기
    /*
// 비밀번호 해싱 유틸리티 함수
private async hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // bcrypt의 기본 설정
  return bcrypt.hash(password, saltRounds);}}
*/



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService, // JWT 토큰 생성을 위해 주입한 서비스
  ) {}


//POST	회원가입	/user/signup
  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where:{email:createUserDto.email}
    });

    if (!_.isNil(existUser)) {
      throw new ConflictException(
        `이미 가입된 ID입니다. ID: ${createUserDto.email}`,
      );
    }
    const newUser = await this.userRepository.save(createUserDto);
          
    return createUserDto.email;
  }

//POST	로그인	/user/login
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email, deletedAt: null },
      select: ['id','email', 'password'],
    });

    if (_.isNil(user)) {
      throw new NotFoundException(`유저를 찾을 수 없습니다. ID: ${email}`);
    }

    if (user.password !== password) {
      throw new UnauthorizedException(
        `유저의 비밀번호가 올바르지 않습니다. ID: ${email}`,
      );
    }

    // 추가된 코드 - JWT 토큰 생성
    const payload = { id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }


//POST	로그아웃	/user/logout
logout() {
  return { message: '로그아웃이 성공적으로 완료되었습니다.' }
  }




// test용 전체조회
  async findAll() {
    const user = await this.userRepository.find({
    });
    if (_.isNil(user)) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    }
    return user
  }

//GET	회원 정보 조회	/user/:userId
async findOne(userId:number, authorization:string) {
    if (!authorization) {
      throw new UnauthorizedException('JWT 토큰이 필요합니다.');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('JWT 토큰이 유효하지 않습니다.');
    }
    const payload = this.jwtService.verify(token);
    const myId = payload.id;

    if (!myId) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
      if (!userId) {
        throw new UnauthorizedException('찾으려는 userId를 입력하세요');
      }
  const user = await this.userRepository.findOne({
    where:{id:userId},
    select: ['name','email'],
  });

  if (_.isNil(user)) {
    throw new NotFoundException(`유저를 찾을 수 없습니다.`);
  }
  return user
}

//GET	내 정보 상세조회	/user/me
  async findMe(authorization:string) {
    if (!authorization) {
      throw new UnauthorizedException('JWT 토큰이 필요합니다.');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('JWT 토큰이 유효하지 않습니다.');
    }

      const payload = this.jwtService.verify(token);
      const userId = payload.id;

      if (!userId) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
const user = await this.userRepository.findOne({
      where:{id : userId},
      select: ['name','email','password'],
    });

    if (_.isNil(user)) {
      throw new NotFoundException(`토큰오류.`);
    }
    return user

}

    
  

//PATCH	회원 정보 수정	/user/me
// 비번수정 안됨
async update( updateUserDto: UpdateUserDto, authorization:string) {
  if (!authorization) {
    throw new UnauthorizedException('JWT 토큰이 필요합니다.');
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    throw new UnauthorizedException('JWT 토큰이 유효하지 않습니다.');
  }
  const payload = this.jwtService.verify(token);
  const myId = payload.id;

  if (!myId) {
    throw new UnauthorizedException('유효하지 않은 토큰입니다.');
  }
    if (!updateUserDto) {
      throw new UnauthorizedException('수정할 정보를 입력하세요');
    }

    // 조회
const myInfo = await this.userRepository.findOne({
  where:{id : myId},
});

if (_.isNil(myInfo)) {
  throw new NotFoundException(`토큰오류.`);
}
    // 비번 비교
    if (updateUserDto.password !==myInfo.password) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }


  updateUserDto.name? updateUserDto.name:myInfo.name
  updateUserDto.email? updateUserDto.email:myInfo.email

  // 비밀번호 업데이트를 별도로 처리
  if (updateUserDto.newPassword) {
    // 비밀번호 해싱 (예: bcrypt)
    //const hashedPassword = await this.hashPassword(updateUserDto.newPassword);
    //updateUserDto.password = hashedPassword;
    updateUserDto.password = updateUserDto.email
    // `newPassword` 필드는 더 이상 필요 없으므로 제거
    delete updateUserDto.newPassword;
  }
    // 덮어쓰기
    const updatedUser = this.userRepository.update({ id: myId },updateUserDto);

  return updatedUser
}

  

//DELETE	회원 탈퇴	/user/me 
  async remove(deleteUserDto:DeleteUserDto,authorization:string) {
    if (!authorization) {
      throw new UnauthorizedException('JWT 토큰이 필요합니다.');
    }
  
    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('JWT 토큰이 유효하지 않습니다.');
    }
    const payload = this.jwtService.verify(token);
    const myId = payload.id;
  
    if (!myId) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
      if (!deleteUserDto) {
        throw new UnauthorizedException('수정할 정보를 입력하세요');
      }
  
      // 조회
  const myInfo = await this.userRepository.findOne({
    where:{id : myId},
    select: ['password'],
  });
  
  if (_.isNil(myInfo)) {
    throw new NotFoundException(`토큰오류.`);
  }
      // 비번 비교
      if (deleteUserDto.password !==myInfo.password) {
        throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
      }
  
  return  this.userRepository.softDelete({ id: myId });
  }
}
