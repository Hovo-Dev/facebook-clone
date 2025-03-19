import { UserInterface } from './user.interface';

export interface FriendInterface {
  id: string;
  user_id: string;
  friend_id: string;
  _user: UserInterface;
  _friend: UserInterface;
  created_at: Date;
}
