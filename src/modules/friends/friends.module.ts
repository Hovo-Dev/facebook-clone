import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UserRepository } from '../database/repositories/user.repository';
import { FriendRepository } from '../database/repositories/friend.repository';
import { FriendRequestsRepository } from '../database/repositories/friend_requests.repository';

@Module({
  imports: [AuthModule],
  controllers: [FriendsController],
  providers: [FriendsService, FriendRepository, FriendRequestsRepository, UserRepository],
})
export class FriendsModule {}
