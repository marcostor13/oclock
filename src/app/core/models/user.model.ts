export interface UserProfile {
  _id?: string;
  photo?: string;
  phone?: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile?: UserProfile;
  permissions?: unknown;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}
