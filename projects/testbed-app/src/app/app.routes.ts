import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<h2>Dashboard</h2><p>Overview and key metrics.</p>`,
})
class DashboardComponent {}

@Component({
  selector: 'app-analytics-overview',
  standalone: true,
  template: `<h2>Analytics Overview</h2><p>Summary for analytics.</p>`,
})
class AnalyticsOverviewComponent {}

@Component({
  selector: 'app-analytics-reports',
  standalone: true,
  template: `<h2>Analytics Reports</h2><p>Reports and insights.</p>`,
})
class AnalyticsReportsComponent {}

@Component({
  selector: 'app-team',
  standalone: true,
  template: `<h2>Team</h2><p>Members and roles.</p>`,
})
class TeamComponent {}

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `<h2>Settings</h2><p>Application settings.</p>`,
})
class SettingsComponent {}

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'analytics/overview', component: AnalyticsOverviewComponent },
  { path: 'analytics/reports', component: AnalyticsReportsComponent },
  { path: 'team', component: TeamComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
];
