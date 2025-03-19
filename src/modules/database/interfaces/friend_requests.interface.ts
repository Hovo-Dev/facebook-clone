import { UserInterface } from './user.interface';
import { FriendRequestStatusEnum } from '../../../enums/friend.enum';

export interface FriendRequestsInterface {
  id: string;
  requester_id: string;
  recipient_id: string;
  _requester: UserInterface;
  _recipient: UserInterface;
  status: FriendRequestStatusEnum;
  created_at: Date;
}
