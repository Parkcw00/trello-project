import { Injectable } from '@nestjs/common';
//import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserDto } from './dto/update-user.dto';

import { CreateUserDto, LoginUserDto, UpdateUserDto } from './user.dto';
@Injectable()
export class UserService {

//POST	회원가입	/user/signup
  signup(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

//POST	로그인	/user/login
login(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

//POST	로그아웃	/user/logout
logout(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }




//GET	회원 정보 조회	/user/:userId
  findAll() {
    return `This action returns all user`;
  }

//GET	내 정보 상세조회	/user/me
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

//PATCH	회원 정보 수정	/user/me
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
//DELETE	회원 탈퇴	/user/me 

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
