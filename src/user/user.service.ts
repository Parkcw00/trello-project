import _ from 'lodash';
import { Repository } from 'typeorm';

import {
  ConflictException, Injectable, NotFoundException, UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import{LoginUserDto}from './dto/login-user.dto'
import { User } from './entities/user.entity';
// import { CreateUserDto, LoginUserDto, UpdateUserDto } from './user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService, // JWT 토큰 생성을 위해 주입한 서비스
  ) {}
//POST	회원가입	/user/signup
  signup(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

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
      select: ['name','email'],
    });

    if (_.isNil(user)) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    }
    return user
  }
//GET	회원 정보 조회	/user/:userId
async findOne(userId: number) {

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
  async findMe(userId: number) {
    const user = await this.userRepository.findOne({
      where:{id:userId},
      select: ['name','email'],
    });

    if (_.isNil(user)) {
      throw new NotFoundException(`토큰오류.`);
    }
    return user
  }

//PATCH	회원 정보 수정	/user/me
  update(id: number, updateUserDto: UpdateUserDto) {
   
  }
//DELETE	회원 탈퇴	/user/me 

  remove(id: number) {
   
  }
}
