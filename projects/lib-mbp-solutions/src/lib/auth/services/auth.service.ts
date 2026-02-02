import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap, throwError } from 'rxjs';
import { AuthLoginResponse } from '../models/access.model';
import { AuthSessionService } from './auth-session.service';
import { BackendLoginResponse, LoginRequest, RefreshRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private session = inject(AuthSessionService);
  private document = inject(DOCUMENT);
  private readonly urlBase = 'http://localhost:8080/auth';

  login(payload: LoginRequest): Observable<AuthLoginResponse> {
    return this.http
      .post<BackendLoginResponse>(`${this.urlBase}/login`, {
        tenant: payload.tenant,
        email: payload.email,
        password: payload.password,
      })
      .pipe(map((resp) => this.mapLoginResponse(resp)));
  }

  // Refresh access token using the refresh token.
  refresh(payload: RefreshRequest): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(`${this.urlBase}/refresh`, payload);
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
      map(() => true),
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

  private resolveTenantFromHost(): string | null {
    const hostname = this.document.defaultView?.location.hostname;
    if (!hostname) return null;
    if (hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return null;
    }
    const parts = hostname.split('.');
    return parts.length > 2 ? parts[0] : null;
  }

  private mapLoginResponse(resp: BackendLoginResponse): AuthLoginResponse {
    const tokenPayload = this.decodeJwtPayload(resp.token);
    const issuedAt =
      typeof tokenPayload?.iat === 'number' ? tokenPayload.iat : Math.floor(Date.now() / 1000);
    const expiresAt = typeof tokenPayload?.exp === 'number' ? tokenPayload.exp : issuedAt;

    return {
      accessToken: resp.token,
      refreshToken: '',
      issuedAt,
      expiresIn: Math.max(0, expiresAt - issuedAt),
      user: {
        id: String(resp.user.id),
        username: resp.user.email,
        fullName: resp.user.name,
        email: resp.user.email,
        roles: resp.user.roles.map((role) => role.name),
        permissions: resp.user.roles.flatMap((role) =>
          (role.permissions ?? []).map((permission) => ({
            id: permission.code,
            name: permission.description ?? permission.code,
          })),
        ),
      },
    };
  }

  private decodeJwtPayload(token: string): { exp?: number; iat?: number } | null {
    const part = token.split('.')[1];
    if (!part) return null;
    try {
      const payload = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
      const decoded = globalThis.atob(padded);
      return JSON.parse(decoded) as { exp?: number; iat?: number };
    } catch {
      return null;
    }
  }
}
