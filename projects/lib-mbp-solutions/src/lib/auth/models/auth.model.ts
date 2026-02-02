export interface LoginRequest {
  email: string;
  password: string;
  tenant: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface BackendPermissionDto {
  id: number;
  code: string;
  description: string;
}

export interface BackendRoleDto {
  id: number;
  name: string;
  description: string;
  permissions?: BackendPermissionDto[];
}

export interface BackendUserDto {
  id: number;
  email: string;
  name: string;
  roles: BackendRoleDto[];
}

export interface BackendTenantDto {
  id: number;
  subdomain: string;
  name: string;
}

export interface BackendLoginResponse {
  token: string;
  user: BackendUserDto;
  tenant: BackendTenantDto;
}
