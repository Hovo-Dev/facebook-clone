import * as v from 'valibot';
import { REQUEST } from '@nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { Inject, Injectable } from '@nestjs/common';
import { UserRequest } from '../../../typings/user-request.type';
import DefaultValidationPipe from "../../../libraries/validation.pipline";
import { FriendRequestStatusEnum, ProcessFriendRequestEnum } from '../../../enums/friend.enum';

export class ProcessRequestDto {
  @ApiProperty({ enum: FriendRequestStatusEnum })
  status: FriendRequestStatusEnum;
}

@Injectable()
export default class ProcessRequestValidationPipe extends DefaultValidationPipe {
  constructor(
    @Inject(REQUEST) protected request: UserRequest,
  ) {
    super();
  }

  /**
   * Return schema rules for validation.
   *
   * @protected
   */
  protected rules() {
    return v.object({
      status: v.pipe(
        v.number(),
        v.enum(ProcessFriendRequestEnum)
      ),
    });
  }
}
