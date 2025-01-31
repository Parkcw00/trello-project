// import { ApiProperty } from '@nestjs/swagger';
// import { IsOptional, IsString, IsIn } from 'class-validator';

// /**
//  * 📌 멤버 역할(role) 변경을 위한 DTO
//  * - `role`은 선택적으로 업데이트 가능
//  * - 허용 가능한 값: `admin`, `member`, `viewer`
//  */
// export class UpdateMemberDto {
//   @ApiProperty({
//     example: 'admin',
//     description: '멤버의 역할 (가능한 값: admin, member, viewer)',
//   })
//   @IsOptional() // 값이 없으면 무시 (업데이트 시 필수 아님)
//   @IsString({ message: 'role은 문자열이어야 합니다.' }) // 문자열 타입만 허용
//   role?: string;
// }
