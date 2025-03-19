import { ApiBearerAuth } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserRequest } from '../../typings/user-request.type';
import { PaginationDTO } from '../../dtos/pagination-output.dto';
import { FriendRequestDTO } from '../../dtos/friend-request.dto';
import SendRequestValidationPipe, { SendRequestDto } from './validation/send-request.pipeline';
import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import ProcessRequestValidationPipe, { ProcessRequestDto } from './validation/process-request.pipeline';
import ListRequestsValidationPipe, { ListRequestsPaginatedDto } from './validation/list-requests.pipeline';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
  ) {}

  @Post("send-request")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getFriendRequests(
    @Req() request: UserRequest,
    @Body(SendRequestValidationPipe) data: SendRequestDto,
  ) {
    await this.friendsService.createFriendRequest(request.user.id, data.recipient_id);
  }

  @Get("list-requests")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async listFriendRequests(
    @Req() request: UserRequest,
    @Query(ListRequestsValidationPipe) query: ListRequestsPaginatedDto,
  ) {
    const response = await this.friendsService.listFriendRequests(request.user.id, query);

    return new PaginationDTO(response, FriendRequestDTO);
  }

  @Put("process-request/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async processFriendRequest(
    @Req() request: UserRequest,
    @Param('id') requestId: string,
    @Body(ProcessRequestValidationPipe) data: ProcessRequestDto,
  ) {
    await this.friendsService.processFriendRequest(request.user.id, requestId, data.status);
  }
}
