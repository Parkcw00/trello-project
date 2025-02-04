// 유저 서비스
import _ from 'lodash';
import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // .env 파일이나 환경 변수를 쉽게 불러올 수 있도록 도와주는 NestJS의 서비스.
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService, // JWT 토큰 생성을 위해 주입한 서비스
    private configService: ConfigService, // .env 파일에 있는 환경 변수 불러오기
  ) {}

  // 비밀번호 해싱 함수
  private async hashPassword(password: string): Promise<string> {
    // .env 파일에서 BCRYPT_SALT_ROUNDS 값을 가져오고, 없으면 기본값 10을 사용.
    const saltRounds = Number(
      this.configService.get('BCRYPT_SALT_ROUNDS', '10'),
    );
    console.log(`Salt Rounds: ${saltRounds}, Type: ${typeof saltRounds}`); // 디버깅용 로그
    return bcrypt.hash(password, saltRounds); // 비밀번호를 해싱해서 안전하게 저장.
  }

  //POST	회원가입	/user/signup
  async create(createUserDto: CreateUserDto) {
    if (createUserDto.verifyPassword !== createUserDto.password) {
      throw new UnauthorizedException(`비밀번호가 서로 다릅니다.`);
    }

    const existUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existUser) {
      throw new ConflictException(
        `이미 가입된 ID입니다. ID: ${createUserDto.email}`,
      );
    }
    // verifyPassword 삭제
    delete createUserDto.verifyPassword;

    if (!createUserDto.password?.trim()) {
      throw new NotFoundException(`비밀번호를 입력하세요`);
    }

    // 비밀번호 해싱 후 저장
    console.log(createUserDto.password); // pw1234

    // 여기서 막힘
    createUserDto.password = await this.hashPassword(createUserDto.password);
    console.log('회원가입 비번해싱 :', createUserDto.password);

    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    console.log('회원가입 서비스 - 저장성공');

    return {
      message: '회원가입이 완료되었습니다.',
      email: createUserDto.email,
    };
  }

  //POST	로그인	/user/login
  //POST	로그인	/user/login
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email, deletedAt: null },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new NotFoundException(`${email} 유저를 찾을 수 없습니다.`);
    }

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        `${email} 유저의 비밀번호가 올바르지 않습니다.`,
      );
    }

    // JWT 토큰 생성
    const payload = { id: user.id, email: user.email };
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);
    return { accessToken, refreshToken };
  }

  /** 액세스 토큰 생성 */
  private createAccessToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRY', '15m'),
    });
  }

  /** 리프레시 토큰 생성 */
  private createRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY', '7d'),
    });
  }

  // accessToken 재발행
  /** 토큰 재발행 */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });

      const payload = { id: decoded.id, email: decoded.email };
      const newAccessToken = this.createAccessToken(payload);
      //const newRefreshToken = this.createRefreshToken(payload);

      return { accessToken: newAccessToken }; //;, refreshToken: newRefreshToken
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  //POST	로그아웃	/user/logout
  /** 로그아웃 (토큰 유효 시간 1초 미만으로 설정) */
  async logout(user) {
    const payload = { id: user.id, email: user.email };
    console.log('로그아웃 서비스');
    // 만료 시간이 1초 미만인 액세스 토큰과 리프레시 토큰 생성
    const expiredAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: '1s',
    });

    const expiredRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET_KEY'),
      expiresIn: '1s',
    });
    return {
      message: '로그아웃이 성공적으로 완료되었습니다.',
      accessToken: expiredAccessToken,
      refreshToken: expiredRefreshToken,
    };
  }

  // test용 전체조회
  async findAll() {
    const user = await this.userRepository.find({});
    if (!user) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    }
    return user;
    return user;
  }

  //GET	회원 정보 조회	/user/:userId
  async findOne(userId: number) {
    if (!userId) {
      throw new UnauthorizedException('찾으려는 userId를 입력하세요');
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['name', 'email'],
    });

    if (!user) {
      throw new NotFoundException(`유저를 찾을 수 없습니다.`);
    }
    return user;
  }

  //GET	내 정보 상세조회	/user/me
  async findMe(userPayload: any) {
    const user = await this.userRepository.findOne({
      where: { id: userPayload.id },
      select: ['name', 'email', 'password'],
    });

    if (!user) {
      throw new NotFoundException(`유저 정보를 찾을 수 없습니다.`);
    }
    return user;
  }

  //PATCH	회원 정보 수정	/user/me
  // 이름, 비번 수정
  async update(updateUserDto: UpdateUserDto, userPayload: any) {
    if (!updateUserDto) {
      throw new UnauthorizedException('수정할 정보를 입력하세요');
    }

    // 조회
    const myInfo = await this.userRepository.findOne({
      where: { id: userPayload.id },
      select: ['password', 'name'],
    });

    if (!myInfo) {
      throw new NotFoundException(`내 계정정보를 확인할 수 없습니다.`);
    }
    // 비번 비교 (bcrypt 사용)
    // bcrypt.compare() : bcrypt 라이브러리에서 제공하는 함수로, 해시된 비밀번호와 사용자로부터 입력받은 평문 비밀번호를 비교할 때 사용
    const isMatch = await bcrypt.compare(
      updateUserDto.password,
      myInfo.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 업데이트할 데이터 생성
    const updatedData: Partial<User> = {
      name: updateUserDto.name || myInfo.name,
      password: updateUserDto.newPassword
        ? await this.hashPassword(updateUserDto.newPassword)
        : myInfo.password,
    };
    // updateUserDto 삭제
    if (updateUserDto.newPassword) {
      delete updateUserDto.newPassword;
    }
    // 데이터베이스 업데이트
    //  await this.userRepository.update({ id: userPayload.id }, updatedData);
    //save()는 데이터가 존재하면 업데이트하고, 존재하지 않으면 삽입(INSERT)한다.
    await this.userRepository.save({ id: userPayload.id, ...updatedData });

    const newUser = await this.userRepository.findOne({
      where: { id: userPayload.id },
      select: ['id', 'name', 'email'],
    });

    if (!newUser) {
      throw new NotFoundException(`${userPayload.id} 유저를 찾을 수 없습니다.`);
    }

    // JWT 토큰 생성
    const payload = { id: newUser.id, email: newUser.email };
    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    return { accessToken, refreshToken, newUser };
  }

  //DELETE	회원 탈퇴	/user/me
  async remove(deleteUserDto: DeleteUserDto, userPayload: any) {
    if (!deleteUserDto) {
      throw new UnauthorizedException('수정할 정보를 입력하세요');
    }

    // 조회
    const myInfo = await this.userRepository.findOne({
      where: { id: userPayload.id },
      select: ['password'],
    });
    if (!myInfo) {
      throw new NotFoundException(`내 계정정보를 확인할 수 없습니다.`);
    }

    // 비번 비교
    const isMatch = await bcrypt.compare(
      deleteUserDto.password,
      myInfo.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 소프트 삭제 수행
    const result = await this.userRepository.softDelete({ id: userPayload.id });
    if (result.affected === 0) {
      throw new BadRequestException('회원을 찾지 못했습니다.');
    }

    const deletedUser = await this.userRepository.findOne({
      where: { id: userPayload.id },
      withDeleted: true,
    });
    if (!deletedUser?.deletedAt) {
      throw new BadRequestException('회원 탈퇴에 실패했습니다.');
    }

    return { message: '회원 탈퇴가 완료되었습니다.' };
  }

  async findById(userId: any) {
    return await this.userRepository.findOneBy({ id: userId });
  }
}
