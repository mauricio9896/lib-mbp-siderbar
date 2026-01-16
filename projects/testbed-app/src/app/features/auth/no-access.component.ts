import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-access',
  template: `
    <section class="no-access">
      <h2>No access</h2>
      <p>Your account does not have permission to view this route.</p>
    </section>
  `,
  styleUrl: './no-access.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-no-access',
  },
})
export class NoAccessComponent {}
