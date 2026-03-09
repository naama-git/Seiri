export interface JwtPayload {
  username: string;
  role: string;
  sub: number;
}

export interface AuthenticatedUser {
  userId: number;
  firstName: string;
  lastName: string;
  userEmail: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthenticatedUser;
}
