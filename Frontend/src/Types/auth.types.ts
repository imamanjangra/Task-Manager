export interface User {
  id: string;
  name: string;
  email: string;
  password : string
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}