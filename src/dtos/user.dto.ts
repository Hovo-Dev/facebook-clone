import { AuthTokenDTO } from './auth-token.dto';
import { UserInterface } from '../modules/database/interfaces/user.interface';

export class UserDTO {
  id: string
  email: string
  first_name: string
  last_name: string
  currentToken: AuthTokenDTO

  constructor(data: UserInterface) {
    this.id = data.id
    this.email = data.email
    this.first_name = data.first_name
    this.last_name = data.last_name
  }
}
