# Sidebar Menu Library

Reusable Angular sidebar component with dark/light theme, collapsible layout, and nested items. Built as a library with standalone components and SCSS styling.

## Install and Build

Build the library:

```bash
ng build sidebar-menu
```

Use from another project by linking the built package or publishing from `dist/sidebar-menu`.

## Basic Usage (Standalone)

```ts
import { Component } from '@angular/core';
import { SidebarComponent, SIDEBAR_EXAMPLE_ITEMS, SidebarItem, SidebarTheme } from 'sidebar-menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent],
  template: `
    <lib-sidebar
      [items]="items"
      [theme]="theme"
      [collapsed]="collapsed"
      (collapsedChange)="collapsed = $event"
    ></lib-sidebar>
  `,
})
export class AppComponent {
  items: SidebarItem[] = SIDEBAR_EXAMPLE_ITEMS;
  theme: SidebarTheme = 'dark';
  collapsed = false;
}
```

## Menu Config

```ts
import { SidebarItem } from 'sidebar-menu';

const items: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'ri-dashboard-line' },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'ri-line-chart-line',
    children: [
      { id: 'overview', label: 'Overview', route: '/analytics/overview' },
      { id: 'reports', label: 'Reports', route: '/analytics/reports', badge: '4' },
    ],
  },
  { id: 'support', label: 'Support', url: 'https://example.com', icon: 'ri-question-line' },
];
```

## Inputs and Outputs

### Inputs
- `items: SidebarItem[]`
- `collapsed: boolean`
- `mobileOpen: boolean`
- `theme: 'light' | 'dark'`
- `title: string`
- `subtitle: string`
- `logoUrl?: string`
- `activeItemId?: string`
- `activeRoute?: string`
- `allowMultipleOpen: boolean`

### Outputs
- `collapsedChange: EventEmitter<boolean>`
- `mobileOpenChange: EventEmitter<boolean>`
- `itemSelected: EventEmitter<SidebarItem>`

## Theme

The component uses CSS variables and `data-sidebar-theme` on the host.

```html
<lib-sidebar [theme]="'light'"></lib-sidebar>
```

Optional service:

```ts
import { ThemeService } from 'sidebar-menu';

constructor(private themeService: ThemeService) {}

setDark(): void {
  this.themeService.setTheme('dark');
}
```

## Icons

Use `icon` with your own icon font or CSS classes.

```ts
{ id: 'team', label: 'Team', route: '/team', icon: 'ri-team-line' }
```

## Testing

```bash
ng test
```
