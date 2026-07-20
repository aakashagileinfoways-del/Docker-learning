import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../UserModule/userService';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.userService.validateLogin(dto.email, dto.password);
    const tokens = this.authService.signUser(user);
    return {
      user: this.userService.toPublicUser(user),
      ...tokens,
    };
  }
}
