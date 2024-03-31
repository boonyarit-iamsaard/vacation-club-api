import { Request } from 'express';
import { TokenPayload } from '../types/token-payload';

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}
