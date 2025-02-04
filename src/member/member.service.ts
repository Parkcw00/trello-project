import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { User } from '../user/entities/user.entity';
import { Board } from '../board/entities/board.entity';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(
    // TypeORM의 `Repository`를 이용하여 데이터베이스 조작
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  /**
   * 특정 보드의 모든 멤버 목록 조회
   * param boardId 조회할 보드의 ID
   * returns 멤버 목록과 성공 메시지
   */
  async findAll(boardId: number) {
    // 보드가 존재하는지 확인
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('해당 보드가 존재하지 않습니다.');

    // 해당 보드에 속한 모든 멤버 조회 (user 정보 포함)
    const members = await this.memberRepository.find({
      where: { boardId },
      relations: ['user'], // 유저 정보와 함께 조회
    });

    return { message: '멤버 조회 성공', members };
  }

  /**
   * 특정 보드 내 특정 멤버 상세 조회
   * param boardId 보드 ID
   * param memberId 조회할 멤버의 ID
   * returns 해당 멤버의 상세 정보
   */
  async findOne(boardId: number, memberId: number) {
    // 보드 내에서 해당 멤버 조회
    const member = await this.memberRepository.findOne({
      where: { id: memberId, boardId },
      relations: ['user'], // 유저 정보 포함
    });

    if (!member) throw new NotFoundException('해당 멤버가 존재하지 않습니다.');
    return { message: '멤버 상세 조회 성공', member };
  }

  /**
   * 특정 보드에 멤버 추가 (중복 방지)
   * param boardId 멤버를 추가할 보드 ID
   * param createMemberDto 추가할 멤버 정보 (userId 필수)
   * param userId 요청을 보낸 사용자의 ID (인증된 사용자)
   * returns 성공 메시지
   */
  async create(
    boardId: number,
    createMemberDto: CreateMemberDto,
    userId: number,
  ) {
    // 보드가 존재하는지 확인
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('해당 보드가 존재하지 않습니다.');

    // 추가할 유저가 존재하는지 확인
    const user = await this.userRepository.findOne({
      where: { id: createMemberDto.userId },
    });
    if (!user) throw new NotFoundException('회원이 존재하지 않습니다.');

    // 해당 보드에 이미 등록된 멤버인지 확인 (중복 방지)
    const existingMember = await this.memberRepository.findOne({
      where: { boardId, userId: createMemberDto.userId },
    });
    if (existingMember)
      throw new ConflictException('이미 이 보드에 추가된 멤버입니다.');

    // 새 멤버 객체 생성
    const newMember = this.memberRepository.create({
      board, // 관계 설정
      user,
      boardId,
      userId: createMemberDto.userId,
    });

    // 데이터베이스에 새로운 멤버 저장
    await this.memberRepository.save(newMember);
    return { message: '멤버가 추가되었습니다!' };
  }

  /**
   * 특정 보드에서 멤버 삭제 (본인만 삭제 가능)
   * param boardId 보드 ID
   * param memberId 삭제할 멤버의 ID
   * param userId 요청을 보낸 사용자의 ID
   * returns 성공 메시지
   */
  async delete(boardId: number, memberId: number, userId: number) {
    // 삭제할 멤버가 존재하는지 확인
    const member = await this.memberRepository.findOne({
      where: { id: memberId, boardId },
    });
    if (!member) throw new NotFoundException('해당 멤버가 존재하지 않습니다.');

    // 요청한 사용자가 해당 멤버인지 확인 (본인만 삭제 가능)
    if (member.userId !== userId)
      throw new UnauthorizedException('해당 멤버를 삭제할 수 없습니다.');

    // 멤버 삭제
    await this.memberRepository.remove(member);
    return { message: '멤버 삭제 성공' };
  }
}
