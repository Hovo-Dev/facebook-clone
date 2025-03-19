import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UserRepository } from '../database/repositories/user.repository';
import { FriendRepository } from '../database/repositories/friend.repository';

@Module({
  imports: [AuthModule],
  providers: [UsersService, UserRepository, FriendRepository],
  controllers: [UsersController]
})
export class UsersModule {}
