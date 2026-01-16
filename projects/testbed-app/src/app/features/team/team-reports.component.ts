import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-team-reports',
  template: `<h2>Team Reports</h2><p>Activity and staffing insights.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamReportsComponent {}
