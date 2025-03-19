import { AuthTokenInterface } from '../modules/database/interfaces/auth-token.interface';

export class AuthTokenDTO {
  bearer?: string
  expired_at: Date

  constructor(data: AuthTokenInterface) {
    this.bearer = data.bearer
    this.expired_at = data.expires_at
  }
}
