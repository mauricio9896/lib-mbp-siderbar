import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccessControlService } from '../services/access-control.service';

export const routeExistsGuard: CanActivateFn = (_route, state) => {
  const access = inject(AccessControlService);
  const router = inject(Router);

  // Block navigation when the route is not part of permissions.
  return access.hasRoute(state.url) ? true : router.createUrlTree(['/no-access']);
};
