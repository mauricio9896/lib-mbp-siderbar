import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  SidebarComponent,
  SIDEBAR_EXAMPLE_ITEMS,
  SidebarItem,
  SidebarTheme,
  SidebarThemeConfig,
  SidebarThemeColors,
} from 'sidebar-menu';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  title = 'Nova Labs';
  subtitle = 'Workspace';
  items: SidebarItem[] = [...SIDEBAR_EXAMPLE_ITEMS];

  theme: SidebarTheme = 'light';

  themeLight: SidebarThemeColors = {
    bg: 'red',
    text: '#050606ff',
    textSecondary: '#475569',
    activeBg: '#2563EB',
    activeText: '#FFFFFF',
    hoverBg: '#E2E8F0',
    border: '#CBD5E1',
  };

  themeConfig: SidebarThemeConfig = {
    light: this.themeLight,
  };

  collapsed = false;
  mobileOpen = false;

  allowMultipleOpen = true;

  logoUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStDb66ZgPNOLPzcQl5jFngadK4-3xuI3Z1wA&s';
  activeRoute = '/analytics/reports';

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }
}
