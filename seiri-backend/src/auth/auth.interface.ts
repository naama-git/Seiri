export interface JwtPayload {
  username: string;
  role: string;
  sub: string;
}

export interface AuthenticatedUser {
  userId: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthenticatedUser;
}
