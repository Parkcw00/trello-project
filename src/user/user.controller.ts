import { Controller, Headers, Get, Post, Body,Req, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

import { JwtService } from '@nestjs/jwt';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


/**POST	회원가입	/user/signup
POST	로그인	/user/login
POST	로그아웃	/user/logout
GET	회원 정보 조회	/user/:userId
GET	내 정보 상세조회	/user/me
PATCH	회원 정보 수정	/user/me
DELETE	회원 탈퇴	/user/me */

@Post('/signup')
async signUp(@Body() createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}

@Post('/login')
async login(@Body() loginUserDto: LoginUserDto) {
  return this.userService.login(loginUserDto);
}

@Get('/users')
async users() {
  return this.userService.findAll();
}
/*
@Post('logout')
async logout(@Headers('Authorization') token: string) {
  return this.userService.logout(token);
}
*/
@Get(':userId')
async getUserInfo(@Headers('authorization') authorization: string, @Param('userId') userId:number) {
  return this.userService.findOne(userId, authorization);
}


@Get('me')
async getMyInfo(@Headers('authorization') authorization: string) {
  return this.userService.findMe(authorization);
}


@Patch('me')
async updateUser(@Body() updateUserDto: UpdateUserDto,@Headers('authorization') authorization: string) {
  return this.userService.update(updateUserDto, authorization);
}

@Delete('me')
async deleteUser(@Headers('authorization') authorization: string) {
  return this.userService.remove(authorization);
}
}