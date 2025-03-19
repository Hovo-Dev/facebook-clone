import { Module } from '@nestjs/common';
import { BaseModule } from './modules/core/base.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FriendsModule } from './modules/friends/friends.module';

@Module({
  imports: [
    BaseModule,
    AuthModule,
    UsersModule,
    FriendsModule,
  ],
})
export class AppModule {}
