import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-analytics-overview',
  template: `<h2>Analytics Overview</h2><p>Summary for analytics.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsOverviewComponent {}
