import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserDto } from './userDto';
import UserEntity, { UserDocument } from './userEntity';
import { UserTier } from '../common/retention.util';

const BCRYPT_ROUNDS = 12;

export type PublicUser = {
  _id: string;
  name: string;
  email: string;
  timezone: string;
  tier: UserTier;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: typeof UserEntity,
  ) {}

  async createUser(userDto: UserDto): Promise<UserDocument> {
    const existing = await this.userRepository
      .findOne({ email: userDto.email.toLowerCase() })
      .exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(userDto.password, BCRYPT_ROUNDS);

    return this.userRepository.create({
      name: userDto.name,
      email: userDto.email.toLowerCase(),
      password: passwordHash,
      timezone: userDto.timezone ?? 'UTC',
      tier: 'free',
    });
  }

  async validateLogin(email: string, password: string): Promise<UserDocument> {
    const user = await this.userRepository
      .findOne({ email: email.toLowerCase() })
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password ?? '');
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userRepository.findById(userId).exec();
  }

  async getUserTier(userId: string): Promise<UserTier> {
    const user = await this.findById(userId);
    return (user?.tier as UserTier) ?? 'free';
  }

  toPublicUser(user: UserDocument): PublicUser {
    return {
      _id: user._id.toString(),
      name: user.name ?? '',
      email: user.email ?? '',
      timezone: user.timezone ?? 'UTC',
      tier: (user.tier as UserTier) ?? 'free',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
