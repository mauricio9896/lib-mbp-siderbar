import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  const auth = inject(AuthService);
  const router = inject(Router);

  // Allow navigation if the session is already valid.
  if (session.isAuthenticated()) return true;

  // Otherwise try a refresh before redirecting to login.
  return auth.refreshIfNeeded().pipe(
    map((ok) => (ok ? true : router.createUrlTree(['/login']))),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
