import { Injectable } from '@nestjs/common';
import { UserInterface } from '../database/interfaces/user.interface';
import PaginationDto from '../../libraries/pagination/pagination.dto';
import { UserRepository } from '../database/repositories/user.repository';
import { FriendInterface } from '../database/interfaces/friend.interface';
import { PaginatedResult } from '../database/repositories/base.repository';
import { UsersSearchPaginatedDto } from './validation/users-search.pipeline';
import { FriendRepository } from '../database/repositories/friend.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly friendsRepository: FriendRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Search for users by advanced search which will accept combinations of first name, last name and age.
   *
   * @param usersSearchPaginatedDto
   */
  async searchUsers(
    usersSearchPaginatedDto: UsersSearchPaginatedDto
  ): Promise<PaginatedResult<UserInterface>> {
    const usersWhereClause: Partial<UserInterface> = {};

    if (usersSearchPaginatedDto?.first_name) {
      usersWhereClause['first_name'] = `%${usersSearchPaginatedDto?.first_name}%`;
    }

    if (usersSearchPaginatedDto?.last_name) {
      usersWhereClause['last_name'] = `%${usersSearchPaginatedDto?.last_name}%`;
    }

    if (usersSearchPaginatedDto?.age) {
      usersWhereClause['age'] = `%${usersSearchPaginatedDto?.age}%`;
    }

    if (usersSearchPaginatedDto?.email) {
      usersWhereClause['email'] = `%${usersSearchPaginatedDto?.email}%`;
    }

    return this.userRepository.findPaginated({
      page: usersSearchPaginatedDto.page,
      limit: usersSearchPaginatedDto.limit,
      where: usersWhereClause,
    })
  }

  /**
   * Get the list of friends for specific user.
   *
   * @param userId - The user id to get the friends for.
   * @param query - The pagination query to use.
   **/
  async getFriends(userId: string, query: PaginationDto): Promise<PaginatedResult<FriendInterface>> {
    return this.friendsRepository.findPaginated({
      where: [
        { user_id: userId },
        { friend_id: userId },
      ],
      relations: {
        user_id: true,
        friend_id: true,
      },
      page: query.page,
      limit: query.limit,
    })
  }
}
