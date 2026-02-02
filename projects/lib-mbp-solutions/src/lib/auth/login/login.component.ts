import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoginRequest } from '../models/auth.model';
import { AuthLoginResponse, AuthService } from 'lib-mbp-solutions';
import { finalize, map } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'mbp-login',
  imports: [CommonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'mbp-login',
  },
})
export class LoginComponent {
  public error = signal('');
  public loading = signal(false);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);

  private readonly authService = inject(AuthService);
  readonly loginResponse = output<AuthLoginResponse>();

  readonly canSubmit = computed(() => {
    return this.email().trim().length > 0 && this.password().length > 0;
  });

  // Emit login request when the form is valid.
  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) return;

    const payload: LoginRequest = {
      email: this.email().trim(),
      password: this.password(),
      tenant: 'mbp-solutions', // VA A QUEDAR QUEMANDO, MAS ADELANTE SE EVALUA LA LOGICA PARA OBTENER EL TENAT
    };

    this.loading.set(true);
    this.authService
      .login(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.loginResponse.emit(res),
        error: (err: HttpErrorResponse) => this.error.set(err.error?.message ?? 'Login failed'),
      });
  }

  // Keep username signal in sync with input.
  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.email.set(target?.value ?? '');
  }

  // Keep password signal in sync with input.
  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.password.set(target?.value ?? '');
  }

  showPasswordOn(): void {
    this.showPassword.set(true);
  }

  showPasswordOff(): void {
    this.showPassword.set(false);
  }
}
