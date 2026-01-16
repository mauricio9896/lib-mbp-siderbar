import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { AuthLoginResponse } from '../access.model';
import { AuthSessionService } from './auth-session.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = inject(AuthSessionService);

  login(payload: LoginRequest): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>('/api/login', payload);
  }

  // Refresh access token using the refresh token.
  refresh(payload: RefreshRequest): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>('/api/refresh', payload);
  }

  // Refresh the session if needed, returning whether a valid session is available.
  refreshIfNeeded(): Observable<boolean> {
    if (this.session.isAuthenticated()) {
      return of(true);
    }

    const refreshToken = this.session.refreshToken();
    if (!refreshToken) {
      return of(false);
    }

    return this.refresh({ refreshToken }).pipe(
      tap((resp) => this.onLoginSuccess(resp)),
      map(() => true)
    );
  }

  // Update session state after login/refresh.
  onLoginSuccess(resp: AuthLoginResponse): void {
    this.session.setFromLogin(resp);
  }

  // Clear the current session.
  logout(): void {
    this.session.clear();
  }
}
