import { Injectable, NotFoundException } from '@nestjs/common';
import { FriendRequestStatusEnum } from '../../enums/friend.enum';
import { PaginatedResult } from '../database/repositories/base.repository';
import { FriendRepository } from '../database/repositories/friend.repository';
import { ListRequestsPaginatedDto } from './validation/list-requests.pipeline';
import { FriendRequestsInterface } from '../database/interfaces/friend_requests.interface';
import { FriendRequestsRepository } from '../database/repositories/friend_requests.repository';

@Injectable()
export class FriendsService {
  constructor(
    private readonly friendRepository: FriendRepository,
    private readonly friendRequestRepository: FriendRequestsRepository,
  ) {}

  /**
   * Create a friend request between two users.
   *
   * @param userId - The sender of the friend request
   * @param recipientId - The recipient of the friend request
   */
  async createFriendRequest(userId: string, recipientId: string): Promise<FriendRequestsInterface> {
    return this.friendRequestRepository.insert({requester_id: userId, recipient_id: recipientId});
  }

  /**
   * Get a paginated list of friend requests for a user.
   *
   * @param userId - The user to get friend requests for
   * @param options - The options for the paginated query
   */
  async listFriendRequests(userId: string, options: ListRequestsPaginatedDto): Promise<PaginatedResult<FriendRequestsInterface>> {
    const friendRequestWhereClause: Record<string, string | number> = {};

    if (options?.status) {
      friendRequestWhereClause['status'] = options?.status;
    }

    return this.friendRequestRepository.findPaginated({
      where: {
        recipient_id: userId,
        ...friendRequestWhereClause
      },
      relations: {
        requester_id: true,
        recipient_id: true
      },
      page: options.page,
      limit: options.limit
    });
  }

  /**
   * Process a friend request by updating the status either accept or decline.
   *
   * @param userId - The user processing the friend request
   * @param requestId - The id of the friend request to process
   * @param status - The status to update the friend request
   */
  async processFriendRequest(userId: string, requestId: string, status: FriendRequestStatusEnum): Promise<void> {
    // Already accepted or declined requests should not be processed
    // Recipient should be the user processing the request
    const friendRequest = await this.friendRequestRepository.findOne({
      where: {
        id: requestId,
        recipient_id: userId,
        status: FriendRequestStatusEnum.Pending
      }
    });
    if (!friendRequest) {
      throw new NotFoundException('Friend request not found');
    }

    // Update the status of the friend request to either accepted or declined
    await this.friendRequestRepository.update({ id: requestId }, { status });

    // If the request was accepted, create a new friend record
    if (status === FriendRequestStatusEnum.Accepted) {
      await this.friendRepository.insert({ user_id: userId, friend_id: friendRequest.requester_id });
    }
  }
}
