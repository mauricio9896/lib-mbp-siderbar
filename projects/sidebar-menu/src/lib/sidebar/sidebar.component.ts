import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarItem, SidebarTheme } from './sidebar.types';

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnChanges {
  @Input() items: SidebarItem[] = [];

  @Input() collapsed = false;
  @Input() mobileOpen = false;

  @Input() theme: SidebarTheme = 'light';
  @Input() title = 'Workspace';
  @Input() subtitle = 'Overview';
  @Input() logoUrl?: string;

  /**
   * Opcional: puedes setear esto desde fuera si quieres forzar un activo
   * (por ejemplo, si no quieres depender solo de routerLinkActive).
   */
  @Input() activeItemId?: string;
  @Input() activeRoute?: string;

  @Input() allowMultipleOpen = false;

  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() mobileOpenChange = new EventEmitter<boolean>();
  @Output() itemSelected = new EventEmitter<SidebarItem>();

  @HostBinding('attr.data-sidebar-theme') get dataTheme(): SidebarTheme {
    return this.theme;
  }

  @HostBinding('class.is-collapsed') get isCollapsed(): boolean {
    return this.collapsed;
  }

  @HostBinding('class.is-mobile-open') get isMobileOpen(): boolean {
    return this.mobileOpen;
  }

  private expandedIds = new Set<string>();

  ngOnChanges(changes: SimpleChanges): void {
    // Auto-expand cuando cambien items o activeRoute
    if (changes['items'] || changes['activeRoute']) {
      this.syncExpandedWithActive();
    }

    // Si se colapsa el sidebar, por UX normalmente ocultamos submenús
    if (changes['collapsed'] && this.collapsed) {
      this.expandedIds.clear();
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);

    // Si colapsa, cerramos submenús por UX
    if (this.collapsed) {
      this.expandedIds.clear();
    } else {
      // al expandir de vuelta, re-sincroniza con activo
      this.syncExpandedWithActive();
    }
  }

  closeMobile(): void {
    if (!this.mobileOpen) return;
    this.mobileOpen = false;
    this.mobileOpenChange.emit(false);
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
    this.mobileOpenChange.emit(this.mobileOpen);
  }

  toggleItem(item: SidebarItem, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (!item.children?.length) return;

    const isOpen = this.expandedIds.has(item.id);

    if (isOpen && this.isItemActive(item)) {
      return;
    }

    if (!this.allowMultipleOpen) {
      this.expandedIds.clear();
    }

    if (isOpen) {
      this.expandedIds.delete(item.id);
    } else {
      this.expandedIds.add(item.id);
    }
  }

  onSelect(item: SidebarItem, event?: Event): void {
    if (item.disabled) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    // Si el item tiene hijos y no tiene route, se comporta como "grupo"
    // (selección no navega; solo expande)
    if (item.children?.length && !item.route && !item.url) {
      event?.preventDefault();
      this.toggleItem(item, event);
      return;
    }

    this.itemSelected.emit(item);
    this.closeMobile();
  }

  isExpanded(item: SidebarItem): boolean {
    return this.expandedIds.has(item.id);
  }

  isItemActive(item: SidebarItem): boolean {
    // 1) Activo por ID (si lo manejas desde afuera)
    if (this.activeItemId && item.id === this.activeItemId) return true;

    // 2) Activo por route explícita (si lo manejas desde afuera)
    if (this.activeRoute) {
      if (item.route === this.activeRoute || item.url === this.activeRoute) return true;
    }

    // 3) Activo si alguno de sus hijos está activo
    if (item.children?.length) {
      return item.children.some((child) => this.isItemActive(child));
    }

    return false;
  }

  trackById(_index: number, item: SidebarItem): string {
    return item.id;
  }

  private syncExpandedWithActive(): void {
    // Si no tenemos forma de saber el activo, no hacemos nada
    if (!this.activeRoute && !this.activeItemId) return;

    const path = this.findActivePath(this.items);
    if (!path.length) return;

    // Expande todos los padres del item activo
    // (menos el último, que es el item final)
    const parentIds = path.slice(0, -1).map((x) => x.id);

    if (!this.allowMultipleOpen) {
      this.expandedIds.clear();
    }

    parentIds.forEach((id) => this.expandedIds.add(id));
  }

  private findActivePath(items: SidebarItem[], trail: SidebarItem[] = []): SidebarItem[] {
    for (const item of items) {
      const nextTrail = [...trail, item];

      const isDirectActive =
        (this.activeItemId && item.id === this.activeItemId) ||
        (this.activeRoute && (item.route === this.activeRoute || item.url === this.activeRoute));

      if (isDirectActive) {
        return nextTrail;
      }

      if (item.children?.length) {
        const childPath = this.findActivePath(item.children, nextTrail);
        if (childPath.length) return childPath;
      }
    }
    return [];
  }
}
