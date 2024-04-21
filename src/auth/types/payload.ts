export type Payload = {
  sub: string;
  email: string;
};

export type AuthenticatedUser = Payload & {
  refreshToken?: string;
};

export type TokenPayload = Payload & {
  iat: number;
  exp: number;
};
