# Sidebar (lib-mbp-solutions)

Menu lateral reutilizable con soporte para items anidados, modo colapsado, temas y badges.

## Que resuelve

- Navegacion consistente con items jerarquicos.
- Modo colapsado con popup de submenus.
- Estilos y layout configurables por tema.
- Integracion con Router para estados activos.

## Requisitos

- Angular Material (MatIcon, MatRipple)
- Router si usas `route` en los items

## Uso basico

```ts
import { Component } from '@angular/core';
import { SidebarComponent, SidebarItem, SidebarTheme } from 'lib-mbp-solutions';

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
  items: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'analytics',
      children: [
        { id: 'overview', label: 'Overview', route: '/analytics/overview' },
        { id: 'reports', label: 'Reports', route: '/analytics/reports', badge: '4' },
      ],
    },
  ];

  theme: SidebarTheme = 'light';
  mobileOpen = false;

  onItemSelected(item: SidebarItem): void {
    // manejar seleccion
  }
}
```

## Modelo SidebarItem

```ts
export interface SidebarItem {
  id: string;
  label: string;
  route?: string;
  icon?: string;
  badge?: string;
  badgeClass?: string;
  children?: SidebarItem[];
}
```

## Inputs

- `items: SidebarItem[]`
- `mobileOpen: boolean`
- `theme: 'light' | 'dark'`
- `title: string`
- `subtitle: string`
- `logoUrl?: string`
- `themeConfig?: SidebarThemeConfig`
- `allowMultipleOpen: boolean`

## Outputs

- `mobileOpenChange: EventEmitter<boolean>`
- `itemSelected: EventEmitter<SidebarItem>`

## Comportamiento

- Maneja colapsado interno y sincroniza submenus activos.
- Si `allowMultipleOpen` es `false`, solo un submenu queda abierto.
- En modo colapsado, muestra popup de subitems.

## Temas y layout

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

## Selectores

- Sidebar: `mbp-sidebar`
- Popup colapsado: `mbp-sidebar-collapsed-popup`

## Notas

- Para iconos, usa cualquier set compatible con `mat-icon`.
- Si usas `route`, el componente utiliza `RouterLink` y `RouterLinkActive`.
