import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../AuthModule/auth.service';
import { UserDto } from './userDto';
import { UserService } from './userService';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('create')
  async createUser(@Body() userDto: UserDto) {
    const user = await this.userService.createUser(userDto);
    const tokens = this.authService.signUser(user);
    return {
      user: this.userService.toPublicUser(user),
      ...tokens,
    };
  }
}
