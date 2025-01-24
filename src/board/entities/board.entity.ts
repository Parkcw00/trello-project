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

  //   @ManyToOne(() => User, (user) => user.boards)??
  //   @JoinColumn({ name: 'onerId' })
  //   users: User;

  //   @OneToMany(() => Member, (member) => member.board)
  //   members: Member[];

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
}
