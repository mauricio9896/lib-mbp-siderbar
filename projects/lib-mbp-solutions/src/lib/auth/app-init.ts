import { APP_INITIALIZER } from '@angular/core';
import { AuthSessionService } from './services/auth-session.service';

// Initialize session state at app startup.
export function initSession(session: AuthSessionService) {
  return () => session.loadFromStorage();
}

export const authAppProviders = [
  {
    provide: APP_INITIALIZER,
    useFactory: initSession,
    deps: [AuthSessionService],
    multi: true,
  },
];
