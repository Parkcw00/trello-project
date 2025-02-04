import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  async findAll(boardId: number) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('해당 보드가 존재하지 않습니다.');

    const members = await this.memberRepository.find({
      where: { boardId },
      relations: ['user'],
    });

    return { message: '멤버 조회 성공', members };
  }

  async findOne(boardId: number, memberId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, boardId },
      relations: ['user'],
    });

    if (!member) throw new NotFoundException('해당 멤버가 존재하지 않습니다.');
    return { message: '멤버 상세 조회 성공', member };
  }

  async create(
    boardId: number,
    createMemberDto: CreateMemberDto,
    userId: number,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException('해당 보드가 존재하지 않습니다.');

    const user = await this.userRepository.findOne({
      where: { id: createMemberDto.userId },
    });
    if (!user) throw new NotFoundException('회원이 존재하지 않습니다.');

    const existingMember = await this.memberRepository.findOne({
      where: { boardId, userId: createMemberDto.userId },
    });

    if (existingMember)
      throw new ConflictException('이미 이 보드에 추가된 멤버입니다.');

    const newMember = this.memberRepository.create({
      board,
      user,
      boardId,
      userId: createMemberDto.userId,
    });
    await this.memberRepository.save(newMember);
    return { message: '멤버가 추가되었습니다!' };
  }

  async delete(boardId: number, memberId: number, userId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, boardId },
    });
    if (!member) throw new NotFoundException('해당 멤버가 존재하지 않습니다.');

    if (member.userId !== userId)
      throw new UnauthorizedException('해당 멤버를 삭제할 수 없습니다.');

    await this.memberRepository.remove(member);
    return { message: '멤버 삭제 성공' };
  }
}
