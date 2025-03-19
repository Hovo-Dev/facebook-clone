import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database.service';
import { UserInterface } from '../interfaces/user.interface';

@Injectable()
export class UserRepository extends BaseRepository<UserInterface> {
  constructor(dbService: DatabaseService) {
    super(dbService, 'users');
  }

  /**
   * Find a user by email.
   *
   * @param email - The email to search.
   */
  async findByEmail(email: string): Promise<UserInterface | null> {
    return this.findOne({ where: { email } });
  }
}
