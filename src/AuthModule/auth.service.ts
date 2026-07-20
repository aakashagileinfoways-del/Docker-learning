import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../UserModule/userEntity';
import { JwtPayload } from './auth.dto';

export type AuthTokens = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  signUser(user: UserDocument): AuthTokens {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email ?? '',
      tier: user.tier ?? 'free',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: '7d',
    };
  }
}
