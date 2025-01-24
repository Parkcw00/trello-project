import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

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

@Post('signup')
async signUp(@Body() createUserDto: CreateUserDto) {
  return this.userService.signup(createUserDto);
}

@Post('login')
async login(@Body() loginUserDto: LoginUserDto) {
  return this.userService.login(loginUserDto);
}

@Post('logout')
async logout(@Headers('Authorization') token: string) {
  return this.userService.logout(token);
}

@Get(':userId')
async getUser(@Param('userId') userId: string, @Headers('Authorization') token: string) {
  return this.userService.getUser(userId, token);
}

@Get('me')
async getMyInfo(@Headers('Authorization') token: string) {
  return this.userService.getMyInfo(token);
}

@Patch('me')
async updateUser(@Body() updateUserDto: UpdateUserDto, @Headers('Authorization') token: string) {
  return this.userService.updateUser(updateUserDto, token);
}

@Delete('me')
async deleteUser(@Headers('Authorization') token: string) {
  return this.userService.deleteUser(token);
}
}