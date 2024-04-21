import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ProfileEntity implements User {
  constructor(partial: Partial<ProfileEntity>) {
    Object.assign(this, partial);
  }

  id: string;

  email: string;

  name: string;

  @Exclude()
  password: string;

  role: Role;

  @Exclude()
  refreshToken: string | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;
}
