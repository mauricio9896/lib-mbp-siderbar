export type SidebarTheme = 'light' | 'dark';

export interface SidebarItem {
  id: string;
  label: string;
  route?: string | any[];
  url?: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
  children?: SidebarItem[];
}

export const SIDEBAR_EXAMPLE_ITEMS: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'ri-dashboard-line',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'ri-line-chart-line',
    children: [
      {
        id: 'analytics-overview',
        label: 'Overview',
        route: '/analytics/overview',
      },
      {
        id: 'analytics-reports',
        label: 'Reports',
        route: '/analytics/reports',
        badge: '4',
      },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    route: '/team',
    icon: 'ri-team-line',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: 'ri-settings-3-line',
  },
];
