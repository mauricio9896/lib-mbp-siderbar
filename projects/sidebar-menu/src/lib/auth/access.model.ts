export type Action = 'create' | 'read' | 'update' | 'delete' | 'export';

export interface PermissionItem {
  id: string;
  name: string;
  icon?: string;
  route?: string;
  badge?: string;
  actions?: Action[];
  submodules?: PermissionItem[];
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: PermissionItem[];
}

export interface AuthSession {
  id: string;
  expiresAt: number;
}

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  issuedAt: number;
  session?: AuthSession;
  user: AuthUser;
}
