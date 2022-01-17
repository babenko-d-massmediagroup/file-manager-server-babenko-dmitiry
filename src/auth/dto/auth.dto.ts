import { IsString, Min, IsNotEmpty } from 'class-validator';

export class AuthUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
export class RegisterUserDto extends AuthUserDto {}
export class LoginUserDto extends AuthUserDto {}

export interface CreateTokenPayload {
  id: string;
  username: string;
}
