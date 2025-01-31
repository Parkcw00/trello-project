import { IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional() // 값이 없으면 무시 (업데이트 시 필수 아님)
  @IsString({ message: 'role은 문자열이어야 합니다.' }) // 문자열 타입만 허용
  role?: string;
}
