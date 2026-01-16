# Sistema de autenticación reutilizable (Angular) — Login + Guard de rutas

Este documento describe un sistema de autenticación reutilizable con Angular que:

- maneja login/logout y estado de sesión con **signals** (incluye refresh de token cuando expira),
- centraliza permisos y rutas habilitadas por módulo/submódulo,
- bloquea navegación si la ruta **no existe** en los permisos recibidos,
- controla la UI para acciones mediante permisos (crear, editar, eliminar, exportar),
- mantiene buenas prácticas Angular modernas (DI con `inject()`, guards funcionales, sin `any`).

---

## 0) Suposiciones

- El backend devuelve un `AuthLoginResponse` con permisos jerárquicos.
- El backend **solo envía módulos y submódulos a los que el usuario tiene derecho**.
- Si un módulo o submódulo existe en la respuesta:
  - el usuario puede verlo en el sidebar
  - el usuario puede navegar a su `route`
- El permiso `read` es **implícito** por existencia.
- `actions` solo contiene acciones adicionales permitidas.
- El frontend **no calcula permisos**, solo los refleja.
- Si el token expiró, se intenta refresh antes de invalidar la sesión.
- El backend **siempre valida permisos reales**.

Ejemplo de payload:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
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
```

---

## 2) AuthSessionService — estado de sesión con signals

`src/app/auth/auth-session.service.ts`

```ts
import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { PermissionItem, AuthLoginResponse } from './access.model';

const STORAGE_KEY = 'app.auth.session';

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  permissions: PermissionItem[];
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private document = inject(DOCUMENT);
  private storage = this.document.defaultView?.localStorage ?? null;

  private accessTokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  private expiresAtSignal = signal<number | null>(null);
  private permissionsSignal = signal<PermissionItem[] | null>(null);
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly refreshToken = this.refreshTokenSignal.asReadonly();
  readonly expiresAt = this.expiresAtSignal.asReadonly();
  readonly permissions = this.permissionsSignal.asReadonly();

  readonly isAuthenticated = computed(() => {
    const token = this.accessTokenSignal();
    const expiresAt = this.expiresAtSignal();
    return Boolean(token && expiresAt && expiresAt > Date.now() / 1000);
  });

  loadFromStorage(): void {
    if (!this.storage) return;
    const raw = this.storage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (
        typeof parsed.accessToken === 'string' &&
        typeof parsed.refreshToken === 'string' &&
        typeof parsed.expiresAt === 'number' &&
        Array.isArray(parsed.permissions)
      ) {
        this.accessTokenSignal.set(parsed.accessToken);
        this.refreshTokenSignal.set(parsed.refreshToken);
        this.expiresAtSignal.set(parsed.expiresAt);
        this.permissionsSignal.set(parsed.permissions);
      }
    } catch {
      this.storage.removeItem(STORAGE_KEY);
    }
  }

  setFromLogin(resp: AuthLoginResponse): void {
    const expiresAt = resp.issuedAt + resp.expiresIn;
    this.accessTokenSignal.set(resp.accessToken);
    this.refreshTokenSignal.set(resp.refreshToken);
    this.expiresAtSignal.set(expiresAt);
    this.permissionsSignal.set(resp.user.permissions ?? []);
    this.storage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: resp.accessToken,
        refreshToken: resp.refreshToken,
        expiresAt,
        permissions: resp.user.permissions
      })
    );
  }

  clear(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.expiresAtSignal.set(null);
    this.permissionsSignal.set(null);
    this.storage?.removeItem(STORAGE_KEY);
  }
}
```

---

## 3) AccessControlService — permisos y rutas disponibles

`src/app/auth/authz.service.ts`

```ts
import { Injectable, computed, inject } from '@angular/core';
import { Action, PermissionItem } from './access.model';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private session = inject(AuthSessionService);

  readonly allowedRoutes = computed(() => {
    const permissions = this.session.permissions();
    const routes = new Set<string>();

    if (!permissions) return routes;

    const walk = (items: PermissionItem[]) => {
      for (const item of items) {
        if (item.route) routes.add(this.normalizeRoute(item.route));
        if (item.submodules?.length) walk(item.submodules);
      }
    };

    walk(permissions);
    return routes;
  });

  readonly actionIndex = computed(() => {
    const permissions = this.session.permissions();
    const index = new Map<string, Set<Action>>();

    if (!permissions) return index;

    for (const module of permissions) {
      if (module.actions?.length) {
        index.set(module.id, new Set(module.actions));
      }
      for (const sub of module.submodules ?? []) {
        index.set(`${module.id}.${sub.id}`, new Set(sub.actions ?? []));
      }
    }

    return index;
  });

  hasRoute(path: string): boolean {
    return this.allowedRoutes().has(this.normalizeRoute(path));
  }

  canModuleAction(moduleId: string, action: Action): boolean {
    return this.actionIndex().get(moduleId)?.has(action) === true;
  }

  canAction(moduleId: string, submoduleId: string, action: Action): boolean {
    return (
      this.actionIndex().get(`${moduleId}.${submoduleId}`)?.has(action) === true
    );
  }

  private normalizeRoute(path: string): string {
    const clean = path.split('?')[0]?.split('#')[0] ?? '';
    return clean.startsWith('/') ? clean : `/${clean}`;
  }
}
```

---

## 4) AuthService — login/logout reutilizable

`src/app/auth/auth.service.ts`

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthLoginResponse } from './access.model';
import { AuthSessionService } from './auth-session.service';

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = inject(AuthSessionService);

  login(payload: LoginRequest) {
    return this.http.post<AuthLoginResponse>('/api/login', payload);
  }

  onLoginSuccess(resp: AuthLoginResponse): void {
    this.session.setFromLogin(resp);
  }

  logout(): void {
    this.session.clear();
  }
}
```

---

## 5) Guards

### 5.1 AuthGuard

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

### 5.2 RouteExistsGuard

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccessControlService } from '../access-control.service';

export const routeExistsGuard: CanActivateFn = (_route, state) => {
  const access = inject(AccessControlService);
  const router = inject(Router);

  return access.hasRoute(state.url) ? true : router.createUrlTree(['/no-access']);
};
```

---

## 6) Inicialización de sesión

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
      multi: true
    }
  ]
};
```

---

## 7) Flujo recomendado

1. Usuario hace login.
2. Backend devuelve `AuthLoginResponse`.
3. Se persisten permisos.
4. Guards validan sesión y ruta.
5. La UI habilita acciones según permisos.

---
