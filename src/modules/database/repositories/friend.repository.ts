import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database.service';
import { FriendInterface } from '../interfaces/friend.interface';

@Injectable()
export class FriendRepository extends BaseRepository<FriendInterface> {
  constructor(dbService: DatabaseService) {
    super(dbService, 'friends', [
      { table: 'users', foreignKey: 'user_id', targetKey: 'id', alias: '_user' },
      { table: 'users', foreignKey: 'friend_id', targetKey: 'id', alias: '_friend' },
    ]);
  }
}
