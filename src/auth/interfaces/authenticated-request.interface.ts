import { Request } from 'express';
import { AuthenticatedUser } from '../types/payload';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
