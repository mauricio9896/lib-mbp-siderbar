import { Routes } from '@angular/router';
import { AuthShellComponent } from './layout/auth-shell.component';
import { authGuard } from '../../../sidebar-menu/src/lib/auth/guards/auth.guard';
import { routeExistsGuard } from '../../../sidebar-menu/src/lib/auth/guards/route-exists.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'no-access',
    loadComponent: () =>
      import('./features/auth/no-access.component').then((m) => m.NoAccessComponent),
  },
  {
    path: '',
    component: AuthShellComponent,
    canActivate: [authGuard, routeExistsGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./features/analytics/analytics.routes').then((m) => m.ANALYTICS_ROUTES),
      },
      {
        path: 'team',
        loadChildren: () => import('./features/team/team.routes').then((m) => m.TEAM_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', pathMatch: 'full', redirectTo: 'login' },
];
