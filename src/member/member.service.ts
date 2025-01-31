import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable() // NestJS에서 이 클래스를 서비스로 사용하도록 지정
export class MemberService {
  constructor(
    // TypeORM의 Repository를 주입받아 DB 조작을 수행
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  /**
   * 특정 보드(boardId)의 모든 멤버 목록 조회
   * @ param boardId - 조회할 보드의 ID
   * @ returns 해당 보드에 속한 멤버 목록과 성공 메시지
   */
  async findAll(boardId: number): Promise<{ message: string; members: Member[] }> {
    // 해당 보드가 존재하는지 확인
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException({ message: '해당 보드가 존재하지 않습니다.' });
    }

    // 해당 보드에 속한 모든 멤버를 조회 (user 정보 포함)
    const members = await this.memberRepository.find({ where: { boardId }, relations: ['user'] });

    return { message: '멤버 조회 성공', members };
  }

  /**
   * 특정 보드(boardId)의 특정 멤버(memberId) 조회
   * @ param boardId - 보드의 ID
   * @ param memberId - 조회할 멤버의 ID
   * @ returns 조회된 멤버 정보와 성공 메시지
   */
  async findOne(boardId: number, memberId: number): Promise<{ message: string; member: Member }> {
    // 특정 보드 내 특정 멤버를 조회 (user 정보 포함)
    const member = await this.memberRepository.findOne({
      where: { id: memberId, boardId },
      relations: ['user'],
    });

    // 멤버가 존재하지 않으면 예외 발생
    if (!member) {
      throw new NotFoundException({ message: '해당 멤버가 존재하지 않습니다.' });
    }

    return { message: '멤버 상세조회 성공', member };
  }

  /**
   * 특정 보드(boardId)에 멤버 추가
   * @ param boardId - 멤버가 추가될 보드 ID
   * @ param createMemberDto - 멤버 추가 요청 DTO (userId 필수)
   * @ returns 성공 메시지
   */
  async create(boardId: number, createMemberDto: CreateMemberDto): Promise<{ message: string }> {
    const { userId } = createMemberDto;

    // 보드가 존재하는지 확인
    const board = await this.boardRepository.findOne({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException({ message: '해당 보드가 존재하지 않습니다.' });
    }

    // 유저가 존재하는지 확인
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ message: '회원이 존재하지 않습니다.' });
    }

    // 새로운 멤버 생성 및 저장
    const newMember = this.memberRepository.create({ board, user, boardId, userId });
    await this.memberRepository.save(newMember);

    return { message: '멤버가 추가되었습니다!' };
  }

  /**
   * 특정 멤버(memberId) 정보 업데이트 (role 변경 가능)
   * @ param boardId - 멤버가 속한 보드 ID
   * @ param memberId - 변경할 멤버의 ID
   * @ param updateMemberDto - 업데이트할 데이터 DTO (role 등)
   * @ returns 성공 메시지
   */
  async update(boardId: number, memberId: number, updateMemberDto: UpdateMemberDto): Promise<{ message: string }> {
    // 특정 멤버가 존재하는지 확인
    const member = await this.memberRepository.findOne({ where: { id: memberId, boardId } });

    if (!member) {
      throw new NotFoundException({ message: '해당 멤버가 존재하지 않습니다.' });
    }

    // 기존 멤버 데이터에 변경할 값만 덮어쓰기 (Object.assign 사용)
    Object.assign(member, updateMemberDto);

    // 변경된 데이터를 저장 (save는 자동으로 변경된 필드만 업데이트)
    await this.memberRepository.save(member);

    return { message: '멤버 정보가 업데이트되었습니다!' };
  }

  /**
   * 특정 보드(boardId)에서 멤버(memberId) 삭제
   * @ param boardId - 멤버가 속한 보드 ID
   * @ param memberId - 삭제할 멤버의 ID
   * @ returns 성공 메시지
   */
  async delete(boardId: number, memberId: number): Promise<{ message: string }> {
    // 특정 멤버 조회
    const member = await this.memberRepository.findOne({ where: { id: memberId, boardId } });

    // 멤버가 존재하지 않으면 예외 발생
    if (!member) {
      throw new NotFoundException({ message: '멤버가 존재하지 않습니다.' });
    }

    // 멤버 삭제 수행
    await this.memberRepository.remove(member);

    return { message: '멤버 삭제 성공' };
  }
}