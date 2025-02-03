import { Board } from 'src/board/entities/board.entity';
import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false, length: 15 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false }) // 해싱하면 길어지니 한계 없애기
  password: string;
  // 예시 :  '$2b$10$1dcY95A77vNF5RgUl8MwYeee3ED2KnmnIUlCx51eHY7v5kW7n7igi'

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Member, (member) => member.user)
  member: Member[];

  @OneToMany(() => Board, (board) => board.user)
  board: Board[];
}
