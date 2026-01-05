import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  SidebarComponent,
  SIDEBAR_EXAMPLE_ITEMS,
  SidebarItem,
  SidebarTheme,
} from 'sidebar-menu';


@Component({
  selector: 'app-root',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  items: SidebarItem[] = SIDEBAR_EXAMPLE_ITEMS;
  theme: SidebarTheme = 'dark';
  collapsed = false;
  mobileOpen = false;
  allowMultipleOpen = true;

  title = 'Nova Labs';
  subtitle = 'Workspace';
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
