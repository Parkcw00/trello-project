import { Member } from '../../member/entities/member.entity';
import { User } from '../../user/entities/user.entity';
import { ColumnEntity } from '../../column/entities/column.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'boards',
})
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.board, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_id' })
  user: User[];

  @Column({ type: 'bigint' })
  ownerId: number;

  @OneToMany(() => Member, (member) => member.board)
  member: Member[];

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'varchar', nullable: false })
  gitLink: string;

  @Column({ type: 'timestamp', nullable: false })
  expriyDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @OneToMany(() => ColumnEntity, (column) => column.board) // 컬럼 엔티티와 1:n 관계 설정
  columns: ColumnEntity[]; // 보드가 1 : 컬럼이 n 관계 설정
}
