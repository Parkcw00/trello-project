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

@Entity({
  name: 'members,',
})
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // 멤버아이디랑 카드아이디 받기

  @ManyToOne(() => User, (user) => user.member, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint' })
  userId: number;

  @ManyToOne(() => Board, (board) => board.member)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @Column({ type: 'bigint' })
  boardId: number;

  @OneToMany(() => Alarm, (alarm) => alarm.member)
  alarm: Alarm[];

  @OneToMany(() => Comment, (comment) => comment.member)
  comment: Comment[];

  @OneToMany(() => Card, (card) => card.member)
  card: Card[];
}
