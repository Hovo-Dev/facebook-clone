import { AuthTokenInterface } from './auth-token.interface';

export interface UserInterface {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  age: number;
  currentToken: AuthTokenInterface | null;
  created_at: Date;
}
