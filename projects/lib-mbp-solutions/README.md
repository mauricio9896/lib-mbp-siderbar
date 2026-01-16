# Sidebar Menu Library

Reusable Angular sidebar component with dark/light theme, collapsible layout, and nested items. Built as a library with standalone components and SCSS styling.

## Requirements
- Angular `^21`
- Angular Material `^21` (uses `MatIcon` and `MatRipple`)
- Angular Router (only if you use `route` in items)

## Install

```bash
npm i lib-mbp-solutions
```

## Build (library dev)

```bash
ng build lib-mbp-solutions
```

Use from another project by linking the built package or publishing from `dist/lib-mbp-solutions`.

## Basic Usage (Standalone)

```ts
import { Component } from '@angular/core';
import {
  SidebarComponent,
  SIDEBAR_EXAMPLE_ITEMS,
  SidebarItem,
  SidebarTheme,
} from 'lib-mbp-solutions';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent],
  template: `
    <mbp-sidebar
      [items]="items"
      [theme]="theme"
      [mobileOpen]="mobileOpen"
      (mobileOpenChange)="mobileOpen = $event"
      (itemSelected)="onItemSelected($event)"
    ></mbp-sidebar>
  `,
})
export class AppComponent {
  items: SidebarItem[] = SIDEBAR_EXAMPLE_ITEMS;
  theme: SidebarTheme = 'dark';
  mobileOpen = false;

  onItemSelected(item: SidebarItem): void {
    // handle selection
  }
}
```

## Menu Config

```ts
import { SidebarItem } from 'lib-mbp-solutions';

const items: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'analytics',
    children: [
      { id: 'overview', label: 'Overview', route: '/analytics/overview' },
      {
        id: 'reports',
        label: 'Reports',
        route: '/analytics/reports',
        badge: '4',
        badgeClass: 'badge-default',
      },
    ],
  },
  { id: 'support', label: 'Support', url: 'https://example.com', icon: 'help' },
];
```

## Inputs and Outputs

### Inputs
- `items: SidebarItem[]`
- `mobileOpen: boolean`
- `theme: 'light' | 'dark'`
- `title: string`
- `subtitle: string`
- `logoUrl?: string`
- `themeConfig?: SidebarThemeConfig`
- `allowMultipleOpen: boolean`

### Outputs
- `mobileOpenChange: EventEmitter<boolean>`
- `itemSelected: EventEmitter<SidebarItem>`

## Theme

The component uses CSS variables and applies a `sidebar-theme-light` or
`sidebar-theme-dark` class on `document.body` for overlays.

```html
<mbp-sidebar [theme]="'light'"></mbp-sidebar>
```

You can customize colors and layout via `themeConfig`:

```ts
import { SidebarThemeConfig } from 'lib-mbp-solutions';

const themeConfig: SidebarThemeConfig = {
  light: {
    bg: '#ffffff',
    text: '#4b5563',
    activeBg: '#eff6ff',
    activeText: '#2563eb',
  },
  dark: {
    bg: '#101218',
    text: '#f5f6f8',
    activeBg: 'rgba(75, 108, 255, 0.16)',
    activeText: '#ffffff',
  },
  layout: {
    width: '280px',
    radius: '12px',
    radiusItem: '4px',
    align: 'center',
    lessHeight: '0px',
  },
};
```

## Icons

Use `icon` with any icon set compatible with `mat-icon` (for example, the Material Icons font).

```ts
{ id: 'team', label: 'Team', route: '/team', icon: 'people' }
```

## Testing

```bash
ng test
```
