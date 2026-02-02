# Auth (lib-mbp-solutions)

Kit de autenticacion con login UI, sesion persistida, permisos y guards listos para usar.

## Que resuelve

- Login UI reusable con estado controlado (loading/error).
- Sesion persistida en localStorage.
- Permisos por modulo/submodulo y validacion de rutas.
- Guards para proteger rutas y acceso por permisos.

## Componentes y servicios

- `LoginComponent` (`mbp-login`)
- `AuthSessionService`
- `AuthService`
- `AccessControlService`
- `authGuard`
- `routeExistsGuard`
- `authAppProviders`

## Modelos

```ts
export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  issuedAt: number;
  session?: { id: string; expiresAt: number };
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    roles: string[];
    permissions: PermissionItem[];
  };
}
```

## Uso basico (Login UI)

```ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginComponent } from 'lib-mbp-solutions';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  template: `
    <mbp-login
      title="Welcome"
      subtitle="Sign in to continue"
      [loading]="loading()"
      [error]="error()"
      (login)="onLogin($event)"
    />
  `,
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onLogin(payload: { email: string; password: string; tenant?: string }): void {
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(payload).subscribe({
      next: (resp) => {
        this.auth.onLoginSuccess(resp);
        void this.router.navigateByUrl('/');
      },
      error: () => {
        this.error.set('Invalid credentials');
        this.loading.set(false);
      },
    });
  }
}
```

## Sesion persistida

Agrega el init en el `ApplicationConfig`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { authAppProviders } from 'lib-mbp-solutions';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), ...authAppProviders],
};
```

## Guards

```ts
import { Routes } from '@angular/router';
import { authGuard, routeExistsGuard } from 'lib-mbp-solutions';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard, routeExistsGuard],
    loadChildren: () => import('./app-shell.routes').then((m) => m.APP_SHELL_ROUTES),
  },
  {
    path: 'login',
    loadComponent: () => import('./login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'no-access',
    loadComponent: () => import('./no-access.component').then((m) => m.NoAccessComponent),
  },
];
```

## Permisos

`AccessControlService` indexa permisos para:

- `hasRoute(path)` valida si la ruta existe en permisos.
- `canModuleAction(moduleId, action)` valida acciones a nivel modulo.
- `canAction(moduleId, submoduleId, action)` valida acciones en submodulo.

## Endpoints esperados

- `POST /auth/login` -> `AuthLoginResponse`
- `POST /api/refresh` -> `AuthLoginResponse`

## Utilidades

- `AUTH_LOGIN_RESPONSE_MOCK` para pruebas locales.
