import { Routes } from '@angular/router';
import { AnalyticsOverviewComponent } from './analytics-overview.component';
import { AnalyticsReportsComponent } from './analytics-reports.component';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: 'overview',
    component: AnalyticsOverviewComponent,
  },
  {
    path: 'reports',
    component: AnalyticsReportsComponent,
  },
];
