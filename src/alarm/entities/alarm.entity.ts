import { User } from '../../user/entities/user.entity';
import { Board } from '../../board/entities/board.entity';
import { Comment } from '../../comment/entities/comment.entity';
import { Card } from '../../card/entities/card.entity';
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
import { Member } from '../../member/entities/member.entity';

@Entity({
  name: 'alarms',
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

  @ManyToOne(() => Member, (member) => member.alarm)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ type: 'bigint' })
  memberId: number;

  @ManyToOne(() => Card, (card) => card.alarm)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ type: 'bigint' })
  cardId: number;
}
