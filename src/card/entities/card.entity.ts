import { Alarm } from 'src/alarm/entities/alarm.entity';
import { ColumnEntity } from 'src/column/entities/column.entity';
import { Member } from 'src/member/entities/member.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { File } from 'src/file/entities/file.entity';

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

  @Column({ type: 'varchar', nullable: true })
  attachtment: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'varchar', nullable: true })
  lexo: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @ManyToOne(() => ColumnEntity, (column) => column.card, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'column_id' })
  column: ColumnEntity;

  @Column({ type: 'bigint' })
  columnId: number;

  @ManyToOne(() => Member, (member) => member.card, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ type: 'bigint' })
  memberId: number;

  @OneToMany(() => Alarm, (alarm) => alarm.card)
  alarm: Alarm[];

  @OneToMany(() => Comment, (comment) => comment.card)
  comment: Comment[];

  @OneToMany(() => File, (file) => file.card)
  file: File[];
}
