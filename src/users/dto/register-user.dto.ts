// src/user/dto/register-user.dto.ts
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  role?: string; // Поле role, можно не передавать, по умолчанию будет 'user'
}
