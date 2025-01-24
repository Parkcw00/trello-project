import { User } from 'src/user/entities/user.entity';
import { Board } from 'src/board/entities/board.entity';
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

  @ManyToOne(() => Member, (member) => member.alarm)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ type: 'bigint' })
  memberId: number;

  @ManyToOne(() => Card, (card) => card.alarm)
  @JoinColumn({ name: 'cardId' })
  card: Card;

  @Column({ type: 'bigint' })
  cardId: number;
}
