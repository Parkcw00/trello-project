import { Card } from '../../card/entities/card.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  // 엔티티 데코레이터 사용
  name: 'checklist', // 테이블 이름 지정
})
export class Checklist {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정 ( 숫자 타입 )

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'boolean', default: false }) // done 속성 추가
  achievement: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Card, (card) => card.checklist, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ type: 'bigint' })
  cardId: number;
}
