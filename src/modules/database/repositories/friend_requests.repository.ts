import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database.service';
import { FriendRequestsInterface } from '../interfaces/friend_requests.interface';

@Injectable()
export class FriendRequestsRepository extends BaseRepository<FriendRequestsInterface> {
  constructor(dbService: DatabaseService) {
    super(dbService, 'friend_requests', [
      { table: 'users', foreignKey: 'requester_id', targetKey: 'id', alias: '_requester' },
      { table: 'users', foreignKey: 'recipient_id', targetKey: 'id', alias: '_recipient' },
    ]);
  }
}
