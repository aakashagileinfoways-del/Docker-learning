import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectGitHubDto {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}
