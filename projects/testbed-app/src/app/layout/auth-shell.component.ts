import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {
  AccessControlService,
  AuthService,
  AuthSessionService,
  PermissionItem,
  SidebarComponent,
  SIDEBAR_EXAMPLE_ITEMS,
  SidebarItem,
  SidebarLayout,
  SidebarTheme,
  SidebarThemeColors,
  SidebarThemeConfig,
} from 'sidebar-menu';

@Component({
  selector: 'app-auth-shell',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShellComponent {
  private session = inject(AuthSessionService);
  private auth = inject(AuthService);
  private accessControl = inject(AccessControlService);
  private router = inject(Router);

  readonly title = 'Nova Labs';
  readonly subtitle = 'Workspace';

  readonly theme = signal<SidebarTheme>('light');

  readonly themeLight: SidebarThemeColors = {
    bg: '#F4FBF9',
    text: '#134E4A',
    textSecondary: '#4D7C76',
    activeBg: '#2DD4BF',
    activeText: '#022C22',
    hoverBg: '#CCFBF1',
    border: '#99F6E4',
  };

  readonly layout: SidebarLayout = {
    lessHeight: '20px',
  };

  readonly themeConfig: SidebarThemeConfig = {
    light: this.themeLight,
    layout: this.layout,
  };

  readonly mobileOpen = signal(false);
  readonly allowMultipleOpen = signal(false);

  readonly logoUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStDb66ZgPNOLPzcQl5jFngadK4-3xuI3Z1wA&s';

  readonly items = computed(() => {
    const permissions = this.session.permissions();
    return permissions ? this.mapPermissions(permissions) : [...SIDEBAR_EXAMPLE_ITEMS];
  });

  toggleTheme(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  toggleMobile(): void {
    this.mobileOpen.update((current) => !current);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  canExportReports(): boolean {
    return this.accessControl.canAction('analytics', 'reports', 'export');
  }

  private mapPermissions(items: PermissionItem[]): SidebarItem[] {
    return items.map((item) => ({
      id: item.id,
      label: item.name,
      route: item.route,
      icon: item.icon,
      badge: item.badge,
      children: item.submodules?.map((sub) => ({
        id: `${item.id}.${sub.id}`,
        label: sub.name,
        route: sub.route,
        icon: sub.icon,
        badge: sub.badge,
      })),
    }));
  }
}
