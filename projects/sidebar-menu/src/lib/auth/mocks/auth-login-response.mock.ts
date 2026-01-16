import { AuthLoginResponse } from '../access.model';

export const AUTH_LOGIN_RESPONSE_MOCK: AuthLoginResponse = {
  accessToken: 'jwt-access-token',
  refreshToken: 'refresh-token',
  expiresIn: 900,
  issuedAt: 1710000000,
  session: {
    id: 'sess_9f2c1a7b',
    expiresAt: 1710003600,
  },
  user: {
    id: '12345',
    username: 'usuario@empresa.com',
    fullName: 'Juan Perez',
    email: 'usuario@empresa.com',
    roles: ['ADMIN', 'USER'],
    permissions: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
      },
      {
        id: 'analytics',
        name: 'Analytics',
        icon: 'analytics',
        submodules: [
          {
            id: 'overview',
            name: 'Overview',
            route: '/analytics/overview',
          },
          {
            id: 'reports',
            name: 'Reports',
            route: '/analytics/reports',
            badge: '4',
            actions: ['create', 'update', 'export'],
          },
        ],
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: 'settings',
        route: '/settings',
        actions: ['update'],
      },
    ],
  },
};
