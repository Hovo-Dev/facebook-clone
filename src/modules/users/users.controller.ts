import UsersSearchValidationPipe, { UsersSearchPaginatedDto } from './validation/users-search.pipeline';
import { Controller, Get, HttpCode, HttpStatus, Query, Req, UseGuards } from '@nestjs/common';
import { PaginationDTO } from '../../dtos/pagination-output.dto';
import { UserRequest } from '../../typings/user-request.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserDTO } from '../../dtos/user.dto';
import { FriendDTO } from '../../dtos/friend.dto';
import ListFriendsValidationPipe from './validation/list-friends.pipeline';
import PaginationDto from '../../libraries/pagination/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async searchUsers(
    @Query(UsersSearchValidationPipe) searchQuery: UsersSearchPaginatedDto,
  ) {
    const response = await this.usersService.searchUsers(searchQuery);

    return new PaginationDTO(response, UserDTO);
  }

  @Get('friends')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getFriends(
    @Req() request: UserRequest,
    @Query(ListFriendsValidationPipe) query: PaginationDto,
  ) {
    const response = await this.usersService.getFriends(request.user.id, query);

    return new PaginationDTO(response, FriendDTO);
  }
}
