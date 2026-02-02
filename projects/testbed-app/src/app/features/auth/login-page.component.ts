import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AUTH_LOGIN_RESPONSE_MOCK,
  AuthLoginResponse,
  AuthService,
  LoginComponent,
} from 'lib-mbp-solutions';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  template: `
    <section class="login-page">
      <mbp-login
        title="Welcome MPB Solutions"
        subtitle="Sign in to explore our app"
        (login)="onLogin()"
      />
    </section>
  `,
  styles: `
    .login-page {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100vh;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onLogin(): void {
    this.loading.set(true);
    this.error.set(null);

    const now = Math.floor(Date.now() / 1000);
    const response: AuthLoginResponse = {
      ...AUTH_LOGIN_RESPONSE_MOCK,
      issuedAt: now,
      session: {
        id: AUTH_LOGIN_RESPONSE_MOCK.session?.id ?? 'sess_9f2c1a7b',
        expiresAt: now + AUTH_LOGIN_RESPONSE_MOCK.expiresIn,
      },
    };

    this.auth.onLoginSuccess(response);
    this.loading.set(false);
    void this.router.navigateByUrl('/dashboard');
  }
}
