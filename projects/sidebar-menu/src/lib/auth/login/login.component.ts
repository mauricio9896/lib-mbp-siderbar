import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { LoginRequest } from '../services/auth.service';

@Component({
  selector: 'lib-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lib-login',
  },
})
export class LoginComponent {
  readonly title = input('Sign in');
  readonly subtitle = input<string | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  readonly login = output<LoginRequest>();

  readonly username = signal('');
  readonly password = signal('');

  readonly canSubmit = computed(() => {
    return !this.loading() && this.username().trim().length > 0 && this.password().length > 0;
  });

  // Emit login request when the form is valid.
  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) return;
    this.login.emit({ username: this.username().trim(), password: this.password() });
  }

  // Keep username signal in sync with input.
  onUsernameInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.username.set(target?.value ?? '');
  }

  // Keep password signal in sync with input.
  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.password.set(target?.value ?? '');
  }
}
