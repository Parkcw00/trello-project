import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common'; // 중복 예외 처리 추가

/**
 * 멤버 서비스 클래스
 * - 특정 보드(Board)에 대한 멤버(Member) 관리 기능을 제공
 * - 보드에 멤버 추가, 조회, 삭제 기능 포함
 */
@Injectable()
export class MemberService {
  /**
   * 생성자 (Dependency Injection)
   * - `Repository<Member>`: 멤버 테이블 조작을 위한 TypeORM Repository
   * - `Repository<User>`: 사용자 테이블 조작을 위한 TypeORM Repository
   * - `Repository<Board>`: 보드 테이블 조작을 위한 TypeORM Repository
   * - `JwtService`: JWT 인증 및 토큰 검증을 수행
   */
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    private jwtService: JwtService, // JWT 검증을 위한 서비스
  ) {}

  /**
   * JWT 토큰을 검증하고 사용자 ID를 반환하는 메서드
   * - Authorization 헤더에서 JWT 토큰을 추출하고 검증함
   * - 검증이 성공하면 `userId` 반환, 실패하면 예외 발생
   *
   * @ param authorization - HTTP 요청 헤더에서 전달된 JWT 토큰
   * @ returns number - JWT에서 추출된 사용자 ID
   */
  private verifyToken(authorization: string): number {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('JWT 토큰이 필요합니다.');
    }

    const token = authorization.split(' ')[1]; // "Bearer <토큰>" 형식이므로 "Bearer "를 제거하고 토큰만 추출

    try {
      const payload = this.jwtService.verify(token); // JWT 토큰 검증
      return payload.id; // 검증된 JWT에서 사용자 ID 추출
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * 특정 보드의 모든 멤버 조회
   * - 해당 보드에 등록된 모든 멤버 목록을 반환함
   *
   * @param boardId - 조회할 보드 ID
   * @returns { message: string; members: Member[] } - 멤버 목록과 성공 메시지 반환
   */
  async findAll(
    boardId: number,
  ): Promise<{ message: string; members: Member[] }> {
    // 보드가 존재하는지 확인
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException({
        message: '해당 보드가 존재하지 않습니다.',
      });
    }

    // 해당 보드에 속한 모든 멤버 조회 (user 정보 포함)
    const members = await this.memberRepository.find({
      where: { boardId },
      relations: ['user'],
    });

    return { message: '멤버 조회 성공', members };
  }

  /**
   * 특정 보드에서 특정 멤버 조회
   * - 해당 보드에서 특정 멤버의 상세 정보를 조회함
   *
   * @ param boardId - 보드 ID
   * @ param memberId - 조회할 멤버 ID
   * @ returns { message: string; member: Member } - 특정 멤버 정보 반환
   */
  async findOne(
    boardId: number,
    memberId: number,
    authorization: string, // 🔹 Authorization 추가
  ): Promise<{ message: string; member: Member }> {
    // 특정 보드 내 특정 멤버를 조회 (user 정보 포함)
    const member = await this.memberRepository.findOne({
      where: { id: memberId, boardId },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException({
        message: '해당 멤버가 존재하지 않습니다.',
      });
    }

    return { message: '멤버 상세조회 성공', member };
  }

  /**
   * 특정 보드에 멤버 추가
   * - 사용자가 보드에 새로운 멤버를 추가할 수 있음
   * - `Authorization` 헤더에서 JWT 토큰을 검증하고 추가 진행
   *
   * @ param boardId - 멤버를 추가할 보드 ID
   * @ param createMemberDto - 추가할 멤버 정보 (userId 필수)
   * @ param authorization - 요청자의 JWT 토큰
   * @ returns { message: string } - 성공 메시지 반환
   */
  async create(
    boardId: number,
    createMemberDto: CreateMemberDto,
    authorization: string,
  ): Promise<{ message: string }> {
    const userId = this.verifyToken(authorization); // JWT 검증

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException({
        message: '해당 보드가 존재하지 않습니다.',
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: createMemberDto.userId },
    });
    if (!user) {
      throw new NotFoundException({ message: '회원이 존재하지 않습니다.' });
    }

    // ✅ 중복 체크 추가 (해당 보드에 같은 userId가 있는지 확인)
    const existingMember = await this.memberRepository.findOne({
      where: { boardId, userId: createMemberDto.userId },
    });

    if (existingMember) {
      throw new ConflictException({
        message: '이미 이 보드에 추가된 멤버입니다.',
      });
    }

    const newMember = this.memberRepository.create({
      board,
      user,
      boardId,
      userId: createMemberDto.userId,
    });

    await this.memberRepository.save(newMember);
    return { message: '멤버가 추가되었습니다!' };
  }

  /**
   * 특정 보드에서 멤버 삭제
   * - 보드에서 특정 멤버를 삭제할 수 있음
   * - `Authorization` 헤더에서 JWT 토큰을 검증하고 삭제 진행
   *
   * @ param boardId - 보드 ID
   * @ param memberId - 삭제할 멤버 ID
   * @ param authorization - 요청자의 JWT 토큰
   * @ returns { message: string } - 성공 메시지 반환
   */
  async delete(
    boardId: number,
    memberId: number,
    authorization: string,
  ): Promise<{ message: string }> {
    const userId = this.verifyToken(authorization); // 요청한 사용자의 ID 추출

    // 삭제할 멤버가 존재하는지 확인
    const member = await this.memberRepository.findOne({
      where: { id: memberId, boardId },
    });

    if (!member) {
      throw new NotFoundException({
        message: '해당 멤버가 존재하지 않습니다.',
      });
    }

    // 요청한 사용자가 해당 멤버인지 확인 (본인만 삭제 가능)
    if (member.userId !== userId) {
      throw new UnauthorizedException('해당 멤버를 삭제할 수 없습니다.');
    }

    await this.memberRepository.remove(member);
    return { message: '멤버 삭제 성공' };
  }
}
