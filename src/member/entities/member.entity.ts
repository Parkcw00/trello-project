import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { Alarm } from 'src/alarm/entities/alarm.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Card } from 'src/card/entities/card.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Member 엔티티: members 테이블에 해당
@Entity({
  name: 'members',
})
export class Member {
  // 기본 키 (자동 생성 ID)
  @PrimaryGeneratedColumn()
  id: number;

  // 데이터가 마지막으로 수정된 시간
  @UpdateDateColumn()
  updatedAt: Date;

  // 데이터가 생성된 시간
  @CreateDateColumn()
  createdAt: Date;

  // 데이터가 삭제된 시간 (소프트 삭제)
  @DeleteDateColumn()
  deletedAt: Date;


  // 사용자 ID와 연결 (ManyToOne 관계)
  @ManyToOne(() => User, (user) => user.member, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 사용자 ID 값 저장
  @Column({ type: 'bigint' })
  userId: number;

  // 게시판 ID와 연결 (ManyToOne 관계)
  @ManyToOne(() => Board, (board) => board.member)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  // 게시판 ID 값 저장
  @Column({ type: 'bigint' })
  boardId: number;

  // 알람과의 관계 설정 (OneToMany 관계)
  @OneToMany(() => Alarm, (alarm) => alarm.member)
  alarm: Alarm[];

  // 댓글과의 관계 설정 (OneToMany 관계)
  @OneToMany(() => Comment, (comment) => comment.member)
  comment: Comment[];

  // 카드와의 관계 설정 (OneToMany 관계)
  @OneToMany(() => Card, (card) => card.member)
  card: Card[];
}
