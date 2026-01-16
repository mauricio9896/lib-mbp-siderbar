import { Routes } from '@angular/router';
import { TeamOverviewComponent } from './team-overview.component';
import { TeamReportsComponent } from './team-reports.component';

export const TEAM_ROUTES: Routes = [
  {
    path: 'overview',
    component: TeamOverviewComponent,
  },
  {
    path: 'reports',
    component: TeamReportsComponent,
  },
];
