# Implementación Frontend (Angular) — Acciones por Submódulo con `*can="perms.create"`

Este documento describe los pasos para implementar un esquema de **módulos/submódulos con permisos de acciones** en el frontend usando:

- Un **AuthzService** que carga el árbol de permisos (el JSON que llega del backend).
- Una **directiva estructural** `*can` para mostrar/ocultar elementos según permiso.
- Un **builder** `submodulePerm(...)` para evitar repetir strings en el template:  
  `*can="perms.create"`, `*can="perms.delete"`, etc.

---

## 0) Requisitos / Suposiciones

- Estás usando Angular (standalone o con módulos). Los ejemplos están en standalone, pero aplican igual.
- El backend devuelve un JSON con estructura tipo:

```json
{
  "modules": [
    {
      "key": "admin",
      "name": "Administración",
      "submodules": [
        {
          "key": "users",
          "name": "Usuarios",
          "route": "/admin/users",
          "actions": { "read": true, "create": true, "update": true, "delete": false, "export": false }
        }
      ]
    }
  ]
}
```

---

## 1) Define tipos (modelos)

Crea un archivo, por ejemplo:

`src/app/auth/access.model.ts`

```ts
export type Action = 'create' | 'read' | 'update' | 'delete' | 'export';

export type PermissionKey = `${string}.${string}.${Action}`;

export interface SubmoduleDto {
  key: string;
  name: string;
  route: string;
  actions: Partial<Record<Action, boolean>>;
}

export interface ModuleDto {
  key: string;
  name: string;
  submodules: SubmoduleDto[];
}

export interface AccessDto {
  modules: ModuleDto[];
}
```

---

## 2) Crea el `AuthzService`

Archivo sugerido:

`src/app/auth/authz.service.ts`

Este servicio:
- recibe el árbol al autenticarse,
- lo “aplana” a un `Map` para consultas rápidas,
- expone `canKey('admin.users.create')`.

```ts
import { Injectable } from '@angular/core';
import { AccessDto, PermissionKey } from './access.model';

@Injectable({ providedIn: 'root' })
export class AuthzService {
  private permissions = new Map<string, boolean>();

  load(access: AccessDto) {
    this.permissions.clear();

    for (const m of access.modules) {
      for (const s of m.submodules) {
        for (const [action, allowed] of Object.entries(s.actions)) {
          const key = `${m.key}.${s.key}.${action}`;
          this.permissions.set(key, !!allowed);
        }
      }
    }
  }

  clear() {
    this.permissions.clear();
  }

  canKey(key: PermissionKey): boolean {
    return this.permissions.get(key) === true;
  }
}
```

---

## 3) Crea el builder `submodulePerm(...)`

Archivo sugerido:

`src/app/auth/perm.builder.ts`

Esto te permite generar `perms.create`, `perms.delete`, etc. sin repetir strings en el template.

```ts
import { PermissionKey } from './access.model';

export function submodulePerm(module: string, submodule: string) {
  const base = `${module}.${submodule}`;

  return {
    base: base as const,
    create: `${base}.create` as PermissionKey,
    read: `${base}.read` as PermissionKey,
    update: `${base}.update` as PermissionKey,
    delete: `${base}.delete` as PermissionKey,
    export: `${base}.export` as PermissionKey,
  };
}
```

---

## 4) Crea la directiva estructural `*can`

Archivo sugerido:

`src/app/auth/can.directive.ts`

La directiva:
- recibe un `PermissionKey` (ej: `'admin.users.delete'`),
- pregunta al `AuthzService`,
- decide si renderiza o no el contenido.

```ts
import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthzService } from './authz.service';
import { PermissionKey } from './access.model';

@Directive({
  selector: '[can]',
  standalone: true
})
export class CanDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private authz = inject(AuthzService);

  @Input('can') set permissionKey(key: PermissionKey) {
    this.vcr.clear();
    if (this.authz.canKey(key)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
```

---

## 5) Carga permisos al autenticar (punto de integración)

En tu flujo de login (cuando ya tienes la respuesta del backend), llama:

```ts
this.authz.load(accessFromBackend);
```

### Ejemplo mínimo (mock)
```ts
import { AuthzService } from './auth/authz.service';

constructor(private authz: AuthzService) {}

onLoginSuccess(accessFromBackend: any) {
  this.authz.load(accessFromBackend);
}
```

> Nota: donde ocurra esto depende de tu arquitectura (AuthService, SessionService, etc.).  
> La regla: **cargar permisos una sola vez cuando el usuario inicia sesión** (y limpiar al logout).

---

## 6) Usar en un componente (ejemplo real)

### 6.1 Componente `UsersPage`

**TS** (`users.page.ts`):
```ts
import { Component } from '@angular/core';
import { CanDirective } from '../auth/can.directive';
import { submodulePerm } from '../auth/perm.builder';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CanDirective],
  templateUrl: './users.page.html'
})
export class UsersPage {
  perms = submodulePerm('admin', 'users');
}
```

**HTML** (`users.page.html`):
```html
<h1>Usuarios</h1>

<button *can="perms.create">Crear</button>
<button *can="perms.delete">Eliminar</button>
<button *can="perms.export">Exportar</button>
```

✅ Con esto:
- si el backend trae `actions.create = true`, se renderiza “Crear”
- si `actions.delete = false`, “Eliminar” no aparece
- si `actions.export = false`, “Exportar” no aparece

---

## 7) (Opcional) Variante: deshabilitar en vez de ocultar

Si quieres mostrar el botón pero deshabilitado:

### 7.1 Directiva `[disableIfNoCan]`

Archivo sugerido:

`src/app/auth/disable-if-no-can.directive.ts`

```ts
import { Directive, ElementRef, Input, inject } from '@angular/core';
import { AuthzService } from './authz.service';
import { PermissionKey } from './access.model';

@Directive({
  selector: '[disableIfNoCan]',
  standalone: true
})
export class DisableIfNoCanDirective {
  private el = inject(ElementRef<HTMLElement>);
  private authz = inject(AuthzService);

  @Input('disableIfNoCan') set permissionKey(key: PermissionKey) {
    const ok = this.authz.canKey(key);

    const native: any = this.el.nativeElement;
    if ('disabled' in native) native.disabled = !ok;

    this.el.nativeElement.style.opacity = ok ? '1' : '0.5';
    this.el.nativeElement.style.pointerEvents = ok ? 'auto' : 'none';
  }
}
```

Uso:
```html
<button [disableIfNoCan]="perms.export">Exportar</button>
```

---

## 8) Checklist rápido (pasos resumidos)

1. **Crear modelos** (`Action`, `PermissionKey`, `AccessDto`).
2. **Crear `AuthzService`** con `load()` y `canKey()`.
3. **Crear builder `submodulePerm(module, submodule)`** para obtener `perms.create` etc.
4. **Crear directiva `*can`** (standalone) que consulte `AuthzService`.
5. **En login**, llamar `authz.load(response)`.
6. **En cada página**, definir `perms = submodulePerm('mod', 'sub')`.
7. **En el HTML**, usar:  
   `*can="perms.create"`, `*can="perms.delete"`, `*can="perms.export"`.
8. (Opcional) Agregar directiva para deshabilitar: `[disableIfNoCan]="perms.export"`.

---

## 9) Ejemplos de uso adicionales

### Toolbar con acciones
```html
<div class="toolbar">
  <button *can="perms.create">Nuevo</button>
  <button *can="perms.export">Exportar</button>
</div>
```

### Acciones en una tabla (por fila)
```html
<button *can="perms.update">Editar</button>
<button *can="perms.delete">Eliminar</button>
```

---

## 10) Recomendación práctica

- Para **pantallas**: usa Guard con `read` (esto es navegación).
- Para **acciones**: usa `*can` / `[disableIfNoCan]` (esto es UI dentro de la pantalla).
- Mantén la lógica de permisos **centralizada** en `AuthzService` + directivas, para evitar duplicación y typos.
