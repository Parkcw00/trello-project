// 유저 컨트롤러
import {
  Controller,
  Headers,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  Delete,
  Request,
  BadRequestException,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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
    console.log('회원가입 컨트롤러');
    return this.userService.create(createUserDto);
  }

  /** 로그인 시 토큰 발급 */
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  /** 토큰 재발행 */
  @Get('/refresh')
  async refreshAccessToken(@Headers('RefreshToken') refreshToken: string) {
    if (!refreshToken || !refreshToken.startsWith('Bearer ')) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    const myRefreshToken = refreshToken.split(' ')[1];
    return this.userService.refreshToken(myRefreshToken);
  }

  /** 로그아웃 (토큰 무효화) */
  @Post('/logout')
  // @UseGuards(AuthGuard('jwt')) // ✅ 토큰 필수
  async logout(@Request() req) {
    console.log('로그아웃 컨트롤 - ', req.user);
    return this.userService.logout(req.user);
  }

  @Get('/users')
  async users() {
    return this.userService.findAll();
  }

  // @ApiOperation({ summary: '11' })
  @Get('userId/:userId')
  // @UseGuards(AuthGuard('jwt')) // ✅ 토큰 필수
  async getUserInfo(@Param('userId') userId: string, @Request() req) {
    //const userPayload = req.user;
    return this.userService.findOne(+userId);
  }

  @Get('me')
  // @UseGuards(AuthGuard('jwt')) // ✅ 토큰 필수
  async getMyInfo(@Request() req) {
    const userPayload = req.user;
    return this.userService.findMe(userPayload);
  }

  @Patch('me')
  // @UseGuards(AuthGuard('jwt')) // ✅ 토큰 필수
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userPayload = req.user;
    return this.userService.update(updateUserDto, userPayload);
  }

  @Delete('me')
  // @UseGuards(AuthGuard('jwt')) // ✅ 토큰 필수
  async deleteUser(@Body() deleteUserDto: DeleteUserDto, @Request() req) {
    const userPayload = req.user;
    return this.userService.remove(deleteUserDto, userPayload);
  }
}
