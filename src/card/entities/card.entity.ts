import { Alarm } from 'src/alarm/entities/alarm.entity';
import { ColumnEntity } from 'src/column/entities/column.entity';
import { Member } from 'src/member/entities/member.entity';
import { Comment } from 'src/comment/entities/comment.entity';

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm'; // 여기서 데코레이터 사용할 거 가져오기
@Entity({
  // 엔티티 데코레이터 사용
  name: 'cards', // 테이블 이름 지정
})
export class Card {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정 ( 숫자 타입 )

  @Column({ type: 'varchar', nullable: false }) // 컬럼 데코레이터 사용
  title: string; // 타입 지정 ( 문자열 타입 )

  @Column({ type: 'text', nullable: false }) // 컬럼 데코레이터 사용
  content: string; // 타입 지정 ( 숫자 타입 )

  @Column({ type: 'varchar', nullable: false })
  attachtment: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'bigint', nullable: true })
  cardPosition: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @ManyToOne(() => ColumnEntity, (column) => column.card)
  @JoinColumn({ name: 'columnId' })
  column: ColumnEntity;

  @Column({ type: 'bigint' })
  columnId: number;

  @ManyToOne(() => Member, (member) => member.card)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ type: 'bigint' })
  memberId: number;

  @OneToMany(() => Alarm, (alarm) => alarm.card)
  alarm: Alarm[];

  @OneToMany(() => Comment, (comment) => comment.card)
  comment: Comment[];
}
