import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'comments,',
})
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })ㅁ
  content: string;

  @CreateDateColumn()
  createAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // 멤버아이디랑 카드아이디 받기

  @ManyToOne(()=> Member, (member)=> member.comments)
}
