import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Card } from 'src/card/entities/card.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from 'src/member/entities/member.entity';

@Entity({
  name: 'alarms,',
})
export class Alarm {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'boolean', default: false })
  isRead: string;

  @ManyToOne(() => User, (user) => user.member, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Member, (member) => member.alarm)
  member: Member;

  @Column({ type: 'bigint' })
  memberId: number;

  @ManyToOne(() => Card, (card) => card.alarm)
  card: Card;

  @Column({ type: 'bigint' })
  cardId: number;
}
