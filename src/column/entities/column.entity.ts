import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'; // 여기서 데코레이터 사용할 거 가져오기
@Entity({
  // 엔티티 데코레이터 사용
  name: 'columns', // 테이블 이름 지정
})
export class ColumnEntity {
  @PrimaryGeneratedColumn() // 기본키 생성
  id: number; // 타입 지정 ( 숫자 타입 )

  @Column({ type: 'varchar', nullable: false }) // 컬럼 데코레이터 사용 varchar 이건 문자열을 저장하는것.
  columnType: string; // 타입 지정 ( 문자열 타입 )

  @Column({ type: 'bigint', nullable: false }) // 컬럼 데코레이터 사용
  columnPosition?: number; // 타입 지정 ( 숫자 타입 )

  @ManyToOne(() => Board, (board) => board.columns) // 보드 엔티티와 n:1 관계 설정
  @JoinColumn({ name: 'board_id' }) // 보드 아이디를 조건으로 조회
  board: Board; // 보드 엔티티 인스턴스 생성

  @Column({ type: 'bigint', nullable: false }) // 컬럼 데코레이터 사용
  boardId: number; // 타입 지정 ( 숫자 타입 )

  @OneToMany(() => Card, (card) => card.column) // 카드 엔티티와 1:n 관계 설정
  card: Card[]; // 카드 엔티티 인스턴스 배열 생성
}
