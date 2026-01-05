import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarItem, SidebarTheme } from './sidebar.types';

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {

  @Input() items: SidebarItem[] = [];

  @Input() collapsed = false;
  @Input() mobileOpen = false;

  @Input() theme: SidebarTheme = 'light';
  @Input() title = 'Workspace';
  @Input() subtitle = 'Overview';
  @Input() logoUrl?: string;

  activeItemId?: string;
  activeRoute?: string;
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

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  closeMobile(): void {
    if (!this.mobileOpen) {
      return;
    }

    this.mobileOpen = false;
    this.mobileOpenChange.emit(false);
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
    this.mobileOpenChange.emit(this.mobileOpen);
  }

  toggleItem(item: SidebarItem, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!item.children?.length) {
      return;
    }

    const isOpen = this.expandedIds.has(item.id);
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
      return;
    }

    this.itemSelected.emit(item);
    this.closeMobile();
  }

  isExpanded(item: SidebarItem): boolean {
    return this.expandedIds.has(item.id);
  }

  isItemActive(item: SidebarItem): boolean {
    if (this.activeItemId && item.id === this.activeItemId) {
      return true;
    }

    if (this.activeRoute) {
      return item.route === this.activeRoute || item.url === this.activeRoute;
    }

    if (item.children?.length) {
      return item.children.some((child) => this.isItemActive(child));
    }

    return false;
  }

  trackById(_index: number, item: SidebarItem): string {
    return item.id;
  }
}
