import { Injectable, computed, inject } from '@angular/core';
import { Action, PermissionItem } from '../access.model';
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

  // Index actions by module and submodule for fast lookups.
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

  // Check if a route is allowed based on permissions.
  hasRoute(path: string): boolean {
    return this.allowedRoutes().has(this.normalizeRoute(path));
  }

  // Check action permission at module level.
  canModuleAction(moduleId: string, action: Action): boolean {
    return this.actionIndex().get(moduleId)?.has(action) === true;
  }

  // Check action permission at submodule level.
  canAction(moduleId: string, submoduleId: string, action: Action): boolean {
    return this.actionIndex().get(`${moduleId}.${submoduleId}`)?.has(action) === true;
  }

  // Normalize route string for consistent comparisons.
  private normalizeRoute(path: string): string {
    const clean = path.split('?')[0]?.split('#')[0] ?? '';
    return clean.startsWith('/') ? clean : `/${clean}`;
  }
}
