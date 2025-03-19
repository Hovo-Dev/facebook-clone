import * as v from 'valibot';
import { REQUEST } from '@nestjs/core';
import { ApiProperty } from '@nestjs/swagger';
import { Inject, Injectable } from '@nestjs/common';
import { UserRequest } from '../../../typings/user-request.type';
import DefaultValidationPipe from "../../../libraries/validation.pipline";
import {UserRepository} from "../../database/repositories/user.repository";
import modelExistsRule from '../../../libraries/validation/model-exists.rule';
import modelUniqueRule from '../../../libraries/validation/model-unique.rule';
import { FriendRequestsRepository } from '../../database/repositories/friend_requests.repository';

export class SendRequestDto {
  @ApiProperty()
  recipient_id: string;
}

@Injectable()
export default class SendRequestValidationPipe extends DefaultValidationPipe {
  constructor(
    private readonly friendRequestsRepository: FriendRequestsRepository,
    private readonly userRepository: UserRepository,
    @Inject(REQUEST) protected request: UserRequest,
  ) {
    super();
  }

  /**
   * Return whether parsing should do async.
   *
   * @protected
   */
  protected isAsync = true;

  /**
   * Return schema rules for validation.
   *
   * @protected
   */
  protected rules() {
    return v.objectAsync({
      recipient_id: v.pipeAsync(
        v.string(),
        v.trim(),
        v.uuid('Invalid UUID format for recipient_id.'),
        v.toLowerCase(),
        v.notValue(this.request.user.id, () => "Sending Friend Request To Yourself Is Not Allowed"),
        v.checkAsync(
          (input) => modelUniqueRule('recipient_id', this.friendRequestsRepository)(input),
          (issue) => `Friend Request Already Exists: ` + issue.message,
        ),
        v.checkAsync(
          (input) => modelExistsRule('id', this.userRepository)(input),
          (issue) => `Recipient Doesn't Exists: ` + issue.message,
        ),
      ),
    });
  }
}
