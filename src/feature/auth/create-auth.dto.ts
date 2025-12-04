import { IsInt, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty({ type: String })
  @IsString({ message: 'access_token must be a string' })
  access_token: string;

  @ApiProperty({ type: Number })
  @IsInt({ message: 'expires_in must be an integer' })
  expires_in: number;

  @ApiProperty({ type: Number })
  @IsInt({ message: 'refresh_expires_in must be an integer' })
  refresh_expires_in: number;

  @ApiProperty({ type: String })
  @IsString({ message: 'refresh_token must be a string' })
  refresh_token: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'token_type must be a string' })
  token_type: string;

  @ApiProperty({ type: Number })
  @IsInt({ message: 'not-before-policy must be an integer' })
  'not-before-policy': number;

  @ApiProperty({ type: String })
  @IsString({ message: 'session_state must be a string' })
  session_state: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'scope must be a string' })
  scope: string;
}

export class CreateAuthDtoV {
  @ApiProperty({ type: String, description: 'The name of the user' })
  @IsString({ message: 'username must be a string' })
  username: string;

  @ApiProperty({ type: UserInfoDto, description: 'The object contains all the properties of the user' })
  @ValidateNested()
  @Type(() => UserInfoDto)
  userinfo: UserInfoDto;
}

export class LogoutDto {
  @ApiProperty({ type: String, description: 'refresh token' })
  @IsString({ message: 'refresh_token must be a string' })
  refresh_token: string;
}

export class CreateAuthDto {
  @ApiProperty({ type: String, description: 'The name of the user' })
  @IsString({ message: 'username must be a string' })
  username: string;

  @ApiProperty({ type: String, description: 'The password of the user' })
  @IsString({ message: 'password must be a string' })
  password: string;
}

export class TokenGenerateRequestDto {
  @ApiProperty({ type: String, minLength: 3, maxLength: 50 })
  @IsString({ message: 'username must be a string' })
  @Length(3, 50, { message: 'username must be between 3 and 50 characters' })
  username: string;

  @ApiProperty({ type: String, minLength: 6, maxLength: 100 })
  @IsString({ message: 'password must be a string' })
  @Length(6, 100, { message: 'password must be between 6 and 100 characters' })
  password: string;
}
