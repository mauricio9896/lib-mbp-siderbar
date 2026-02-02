import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthLoginResponse, PermissionItem } from '../models/access.model';

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

  // Load persisted session from storage, if present and valid.
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

  // Persist session data after a successful login/refresh response.
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
        permissions: resp.user.permissions,
      })
    );
  }

  // Clear session state from memory and storage.
  clear(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.expiresAtSignal.set(null);
    this.permissionsSignal.set(null);
    this.storage?.removeItem(STORAGE_KEY);
  }
}
