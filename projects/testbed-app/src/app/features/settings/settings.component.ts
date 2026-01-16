import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `<h2>Settings</h2><p>Application settings.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {}
