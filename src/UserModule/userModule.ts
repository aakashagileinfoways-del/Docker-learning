import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../AuthModule/auth.module';
import { UserController } from './userController';
import { UserService } from './userService';
import UserEntity from './userEntity';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'USER_REPOSITORY',
      useValue: UserEntity,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
