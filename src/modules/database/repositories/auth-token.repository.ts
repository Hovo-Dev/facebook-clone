import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import {AuthTokenInterface} from "../interfaces/auth-token.interface";
import {BaseRepository} from "./base.repository";

@Injectable()
export class AuthTokenRepository extends BaseRepository<AuthTokenInterface> {
  constructor(dbService: DatabaseService) {
    super(dbService, 'auth_tokens', [
      { table: 'users', foreignKey: 'user_id', targetKey: 'id', alias: '_user' },
    ]);
  }
}
