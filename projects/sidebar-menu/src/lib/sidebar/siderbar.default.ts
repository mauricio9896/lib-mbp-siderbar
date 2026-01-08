import { SidebarLayout, SidebarThemeColors } from './sidebar.types';

// Temas por defecto
export const DEFAULT_LIGHT_THEME: SidebarThemeColors = {
  bg: '#ffffff',
  text: '#4b5563',
  textSecondary: '#6b7280',
  activeBg: '#eff6ff',
  activeText: '#2563eb',
  hoverBg: '#f3f4f6',
  border: '#e5e7eb',
};

export const DEFAULT_DARK_THEME: SidebarThemeColors = {
  bg: '#101218',
  text: '#f5f6f8',
  textSecondary: '#a8acb8',
  activeBg: 'rgba(75, 108, 255, 0.16)',
  activeText: '#ffffff',
  hoverBg: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.08)',
};

export const DEFAULT_LAYOUT: SidebarLayout = {
  width: '280px',
  radius: '12px',
  radiusItem: '0px',
  align: 'center',
  lessHeight: '40px',
};
