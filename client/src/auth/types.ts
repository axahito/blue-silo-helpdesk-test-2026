export type User = { username: string; role: string } | null;

export interface AuthContextValue {
  user: User;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  seed: (username: string, password: string, role?: string) => Promise<void>;
}
