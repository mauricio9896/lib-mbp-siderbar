# Sistema de autenticación reutilizable (Angular) — Login + Guard de rutas

Este documento describe un sistema de autenticación reutilizable con Angular que:

- maneja login/logout y estado de sesión con **signals**,
- centraliza permisos y rutas habilitadas por módulo/submódulo,
- bloquea navegación si la ruta **no existe** en los módulos recibidos,
- controla la UI para acciones con directivas de permisos ejemplo crear, descargar, editar,
- mantiene buenas prácticas Angular v21 (DI con `inject()`, sin `@Input`, sin `standalone: true`, sin `any`).

---

## 0) Suposiciones

- El backend devuelve un `AuthLoginResponse` con módulos/submódulos y rutas.
- El frontend necesita permitir navegación solo a rutas existentes en `AuthLoginResponse`.

Ejemplo de payload:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsInJvbGVzIjpbIkFETUlOIiwiVVNFUiJdLCJpYXQiOjE3MTAwMDAwMDAsImV4cCI6MTcxMDAwMDkwMH0.signature",
  "refreshToken": "def50200ab34cd56ef7890aa11223344556677889900aabbccddeeff00112233",
  "expiresIn": 900,
  "issuedAt": 1710000000,
  "session": {
    "id": "sess_9f2c1a7b",
    "expiresAt": 1710003600
  },
  "user": {
    "id": "12345",
    "username": "usuario@empresa.com",
    "fullName": "Juan Perez",
    "email": "usuario@empresa.com",
    "roles": ["ADMIN", "USER"],
    "permissions": [
      {
        "id": "dashboard",
        "name": "Dashboard",
        "icon": "dashboard",
        "route": "/dashboard"
      },
      {
        "id": "analytics",
        "name": "Analytics",
        "icon": "analytics",
        "submodules": [
          {
            "id": "overview",
            "name": "Overview",
            "route": "/analytics/overview"
          },
          {
            "id": "reports",
            "name": "Reports",
            "route": "/analytics/reports",
            "badge": "4",
            "actions": ["create", "update", "export"]
          }
        ]
      },
      {
        "id": "team",
        "name": "Team",
        "icon": "people",
        "submodules": [
          {
            "id": "overview",
            "name": "Overview",
            "route": "/team/overview"
          },
          {
            "id": "reports",
            "name": "Reports",
            "route": "/team/reports",
            "badge": "4",
            "actions": ["update"]
          }
        ]
      },
      {
        "id": "settings",
        "name": "Settings",
        "icon": "settings",
        "route": "/settings",
        "actions": ["update"]
      }
    ]
  }
}

```

---

## 1) Modelos

`src/app/auth/access.model.ts`

```ts
export type Action = 'create' | 'read' | 'update' | 'delete' | 'export';

// Item de permiso que también sirve para construir el sidebar
export interface PermissionItem {
  id: string;           // id lógico: "team", "reports", etc.
  name: string;          // label visible
  icon?: string;         // icono posible 
  route?: string;        // ruta si es hoja o si el padre también navega
  badge?: string;        // opcional, ej "4"
  actions?: Action[]; //! SOLO acciones permitidas * POSIBLEMENTE CAMBIE
  submodules?: PermissionItem[]; // hijos opcionales
}

// Usuario autenticado
export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: PermissionItem[];
}

// Sesión (opcional, pero útil)
export interface AuthSession {
  id: string;
  expiresAt: number; // epoch seconds
}

// Respuesta de login
export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  // segundos (ej 900)
  issuedAt: number;   // epoch seconds
  session?: AuthSession;
  user: AuthUser;
}

```

---

## 2) AuthSession: estado de sesión con signals

`src/app/auth/auth-session.service.ts`

```ts
import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { AccessDto } from './access.model';

const STORAGE_KEY = 'app.access';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private document = inject(DOCUMENT);
  private storage = this.document.defaultView?.localStorage ?? null;

  private accessSignal = signal<AccessDto | null>(null);
  readonly access = this.accessSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.accessSignal() !== null);

  loadFromStorage(): void {
    if (!this.storage) return;
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AccessDto;
      this.accessSignal.set(parsed);
    } catch {
      this.storage.removeItem(STORAGE_KEY);
    }
  }

  setAccess(access: AccessDto): void {
    this.accessSignal.set(access);
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(access));
  }

  clear(): void {
    this.accessSignal.set(null);
    this.storage?.removeItem(STORAGE_KEY);
  }
}
```

---

## 3) AuthzService: permisos y rutas disponibles

`src/app/auth/authz.service.ts`

```ts
import { Injectable, computed, inject } from '@angular/core';
import { AccessDto, PermissionKey } from './access.model';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthzService {
  private session = inject(AuthSessionService);

  readonly permissionMap = computed(() => {
    const access = this.session.access();
    const map = new Map<PermissionKey, boolean>();

    if (!access) return map;

    for (const m of access.modules) {
      for (const s of m.submodules) {
        for (const [action, allowed] of Object.entries(s.actions)) {
          const key = `${m.key}.${s.key}.${action}` as PermissionKey;
          map.set(key, allowed === true);
        }
      }
    }

    return map;
  });

  readonly allowedRoutes = computed(() => {
    const access = this.session.access();
    const routes = new Set<string>();

    if (!access) return routes;

    for (const m of access.modules) {
      for (const s of m.submodules) {
        if (s.route) routes.add(this.normalizeRoute(s.route));
      }
    }

    return routes;
  });

  canKey(key: PermissionKey): boolean {
    return this.permissionMap().get(key) === true;
  }

  hasRoute(path: string): boolean {
    return this.allowedRoutes().has(this.normalizeRoute(path));
  }

  private normalizeRoute(path: string): string {
    const withoutQuery = path.split('?')[0] ?? '';
    const withoutHash = withoutQuery.split('#')[0] ?? '';
    return withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`;
  }
}
```

---

## 4) AuthService: login/logout reutilizable

`src/app/auth/auth.service.ts`

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthSessionService } from './auth-session.service';
import { AccessDto } from './access.model';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: AccessDto;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = inject(AuthSessionService);

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>('/api/login', payload);
  }

  onLoginSuccess(access: AccessDto): void {
    this.session.setAccess(access);
  }

  logout(): void {
    this.session.clear();
  }
}
```

---

## 5) Guards: autenticación y existencia de ruta

### 5.1 AuthGuard (requiere sesión)

`src/app/auth/guards/auth.guard.ts`

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../auth-session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  return session.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
```

### 5.2 RouteExistsGuard (verifica que la ruta exista en módulos)

`src/app/auth/guards/route-exists.guard.ts`

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthzService } from '../authz.service';

export const routeExistsGuard: CanActivateFn = (_route, state) => {
  const authz = inject(AuthzService);
  const router = inject(Router);

  const url = state.url ?? '';
  return authz.hasRoute(url) ? true : router.createUrlTree(['/no-access']);
};
```

---

## 6) Integración en el bootstrap

En tu `app.config.ts` o `main.ts`, carga permisos persistidos antes de enrutamiento:

```ts
import { APP_INITIALIZER } from '@angular/core';
import { AuthSessionService } from './auth/auth-session.service';

export function initSession(session: AuthSessionService) {
  return () => session.loadFromStorage();
}

export const appConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initSession,
      deps: [AuthSessionService],
      multi: true,
    },
  ],
};
```

---

## 7) Uso en rutas

`src/app/app.routes.ts`

```ts
import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { routeExistsGuard } from './auth/guards/route-exists.guard';

export const routes: Routes = [
  {
    path: 'admin/users',
    canActivate: [authGuard, routeExistsGuard],
    loadComponent: () => import('./users/users.page').then((m) => m.UsersPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'no-access',
    loadComponent: () => import('./shared/no-access.page').then((m) => m.NoAccessPage),
  },
];
```

---

## 8) Flujo recomendado

1. Login → `AuthService.login()`.
2. Recibes `access` → `AuthService.onLoginSuccess(access)`.
3. Session persiste `AccessDto`.
4. Guards usan `AuthSessionService` y `AuthzService`.
5. Si la ruta no existe en los módulos, se redirige a `/no-access`.

---

## 9) Notas prácticas

- Evita usar `document` o `window` directamente; usa `DOCUMENT`.
- Mantén la lógica de permisos centralizada en `AuthzService`.
- Si el backend cambia el shape de rutas, actualiza `normalizeRoute`.
- Puedes combinar este guard con un `read` guard si necesitas permisos por acción.
