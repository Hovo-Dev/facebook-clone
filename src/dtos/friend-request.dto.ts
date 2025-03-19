import { UserDTO } from './user.dto';
import { FriendRequestsInterface } from '../modules/database/interfaces/friend_requests.interface';

export class FriendRequestDTO {
  id: string
  requester: UserDTO
  recipient: UserDTO

  constructor(data: FriendRequestsInterface) {
    this.id = data.id
    this.requester = new UserDTO(data._requester)
    this.recipient = new UserDTO(data._recipient)
  }
}
