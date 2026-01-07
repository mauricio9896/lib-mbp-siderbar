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

/**
 * Colores personalizables para cada tema
 */
export interface SidebarThemeColors {
  bg?: string;
  text?: string;
  textSecondary?: string;
  activeBg?: string;
  activeText?: string;
  hoverBg?: string;
  border?: string;
}

/**
 * Variables de layout personalizables
 */
export interface SidebarLayout {
  width?: string;
  radius?: string;
  radiusItem?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  lessHeight?: string;
}

/**
 * Configuración completa de temas y layout
 */
export interface SidebarThemeConfig {
  light?: SidebarThemeColors;
  dark?: SidebarThemeColors;
  layout?: SidebarLayout;
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
    children: [
      {
        id: 'team-overview',
        label: 'Overview',
        route: '/team/overview',
      },
      {
        id: 'team-reports',
        label: 'Reports',
        route: '/team/reports',
        badge: '4',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: 'settings',
  },
];
