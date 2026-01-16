import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-analytics-reports',
  template: `<h2>Analytics Reports</h2><p>Reports and insights.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsReportsComponent {}
