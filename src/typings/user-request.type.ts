import { Request } from 'express';
import {UserInterface} from "../modules/database/interfaces/user.interface";

export type UserRequest = Request & {
  user: UserInterface;
};
