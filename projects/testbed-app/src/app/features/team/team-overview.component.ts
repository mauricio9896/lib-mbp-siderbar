import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-team-overview',
  template: `<h2>Team Overview</h2><p>Members and roles.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamOverviewComponent {}
