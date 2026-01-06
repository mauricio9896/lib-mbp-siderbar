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
    icon: 'dashboard',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'analytics',
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
    icon: 'people',
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: 'settings',
  },
];
