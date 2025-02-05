import { Card } from '../../card/entities/card.entity';
import { Member } from '../../member/entities/member.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'comments',
})
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // 멤버아이디랑 카드아이디 받기
  @ManyToOne(() => Member, (member) => member.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ type: 'bigint', nullable: false })
  memberId: number;

  @ManyToOne(() => Card, (card) => card.comment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ type: 'bigint', nullable: false })
  cardId: number;
}
