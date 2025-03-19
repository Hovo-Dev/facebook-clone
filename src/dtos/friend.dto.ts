import { FriendInterface } from '../modules/database/interfaces/friend.interface';
import { UserDTO } from './user.dto';

export class FriendDTO {
  id: string
  user: UserDTO
  friend: UserDTO

  constructor(data: FriendInterface) {
    this.id = data.id
    this.user = new UserDTO(data._user)
    this.friend = new UserDTO(data._friend)
  }
}
