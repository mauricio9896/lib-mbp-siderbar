import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  SidebarComponent,
  SIDEBAR_EXAMPLE_ITEMS,
  SidebarItem,
  SidebarTheme,
  SidebarThemeConfig,
  SidebarThemeColors,
  SidebarLayout,
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
    bg: '#F4FBF9', // Fondo claro
    text: '#134E4A', // Texto principal
    textSecondary: '#4D7C76', // Texto secundario
    activeBg: '#2DD4BF', // Activo (verde moderno)
    activeText: '#022C22', // Texto activo
    hoverBg: '#CCFBF1', // Hover suave
    border: '#99F6E4', // Borde sutil
  };

  layout: SidebarLayout = {
    lessHeight: '20px'
  }

  themeConfig: SidebarThemeConfig = {
    light: this.themeLight,
    layout: this.layout,
  };

  collapsed = false;
  mobileOpen = false;

  allowMultipleOpen = false;

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
