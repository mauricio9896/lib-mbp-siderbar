import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { SidebarItem, SidebarTheme, SidebarThemeConfig } from './sidebar.types';
import { filter } from 'rxjs/operators';
import { applyThemeVariables } from './siderbar.theme';
import { DOCUMENT } from '@angular/common';
import { SidebarCollapsedPopupComponent } from './components/sidebar-collapsed-popup.component';

@Component({
  selector: 'mbp-sidebar',
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    MatRippleModule,
    SidebarCollapsedPopupComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private _destroyRef = inject(DestroyRef);
  private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _router = inject(Router);
  private _document = inject(DOCUMENT);

  // variables requeridas
  readonly title = input('Workspace');
  readonly items = input<SidebarItem[]>([]);
  readonly logoUrl = input<string | undefined>(undefined);
  readonly mobileOpen = input(false);

  // Opciones del siderbar para una configuracion mas perzonalida
  readonly subtitle = input('Overview');
  readonly theme = input<SidebarTheme>('light');
  readonly themeConfig = input<SidebarThemeConfig | undefined>(undefined);
  readonly allowMultipleOpen = input(false);

  // salidas del siderbar
  readonly mobileOpenChange = output<boolean>();
  readonly itemSelected = output<SidebarItem>();

  readonly overlayThemeClass = computed(() => `sidebar-theme-${this.theme()}`);
  readonly isItemActiveFn = (item: SidebarItem | null | undefined): boolean => this.isItemActive(item);

  //Variables
  readonly collapsed = signal(false);
  readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  readonly openPopupItem = signal<SidebarItem | null>(null);
  readonly popupTop = signal(0);
  readonly popupLeft = signal(0);
  readonly mobileOpenState = signal(false);
  private popupHovered = false;
  private popupAnchorEl: HTMLElement | null = null;
  private closePopupTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this.syncExpandedWithActive();
      });

    effect(() => {
      this.mobileOpenState.set(this.mobileOpen());
    });

    effect(() => {
      if (this.mobileOpenState()) {
        this.collapsed.set(false);
        this.closePopup();
      }
    });

    effect(() => {
      applyThemeVariables(this.theme(), this._elementRef, this._document, this.themeConfig());
    });

    effect(() => {
      this.items();
      this.syncExpandedWithActive();
    });
  }

  toggleCollapse(): void {
    if (this.mobileOpenState()) return;
    const nextCollapsed = !this.collapsed();
    this.collapsed.set(nextCollapsed);

    // Si colapsa, cerramos submenús por UX
    if (nextCollapsed) {
      this.expandedIds.set(new Set());
      this.closePopup();
    } else {
      // al expandir de vuelta, re-sincroniza con activo
      this.syncExpandedWithActive();
    }
  }

  closeMobile(): void {
    if (!this.mobileOpenState()) return;
    this.mobileOpenState.set(false);
    this.mobileOpenChange.emit(false);
  }

  toggleMobile(): void {
    const nextOpen = !this.mobileOpenState();
    this.mobileOpenState.set(nextOpen);
    this.mobileOpenChange.emit(nextOpen);
  }

  onItemClick(item: SidebarItem, event: Event): void {
    if (this.collapsed()) {
      if (item.children?.length) {
        event.preventDefault();
        this.toggleCollapsedPopup(item, event);
        return;
      }
      this.closePopup();
    }

    // Lógica estándar cuando no está colapsado
    if (item.children?.length) {
      // En modo expandido, toggle del acordeón
      this.toggleItem(item, event);
    } else {
      this.onSelect(item, event);
    }
  }

  toggleItem(item: SidebarItem, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    if (!item.children?.length) return;

    const isOpen = this.expandedIds().has(item.id);

    if (isOpen && this.isItemActive(item)) {
      return;
    }

    if (!this.allowMultipleOpen()) {
      const activeParentIds = this.getActiveParentIds();
      this.expandedIds.set(new Set(activeParentIds));
    }

    this.expandedIds.update((current) => {
      const next = new Set(current);
      if (isOpen) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  }

  onSelect(item: SidebarItem | null, event?: Event): void {
    if (!item) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    if (item.children?.length && !item.route) {
      if (this.collapsed()) {
        event?.preventDefault();
        return;
      }
      event?.preventDefault();
      this.toggleItem(item, event);
      return;
    }

    this.itemSelected.emit(item);
    this.closeMobile();
    this.closePopup();
  }

  onCollapsedItemEnter(item: SidebarItem, event: MouseEvent): void {
    if (!this.collapsed()) return;
    this.openPopupItem.set(item);
    this.popupAnchorEl = event.currentTarget as HTMLElement;
    this.positionPopupFromAnchor();
    this.clearClosePopupTimer();
  }

  onCollapsedItemLeave(item: SidebarItem): void {
    if (!this.collapsed()) return;
    if (this.openPopupItem()?.id === item.id) {
      this.scheduleClosePopup();
    }
  }

  onCollapsedPopupEnter(): void {
    this.popupHovered = true;
    this.clearClosePopupTimer();
  }

  onCollapsedPopupLeave(): void {
    this.popupHovered = false;
    this.scheduleClosePopup();
  }

  toggleCollapsedPopup(item: SidebarItem, event?: Event): void {
    if (!this.collapsed()) return;
    if (this.openPopupItem()?.id === item.id) {
      this.closePopup();
      return;
    }
    const target = event?.currentTarget as HTMLElement | null;
    const anchor = target?.closest('.menu-item') as HTMLElement | null;
    this.openPopupItem.set(item);
    this.popupAnchorEl = anchor;
    this.positionPopupFromAnchor();
    this.clearClosePopupTimer();
  }

  onCollapsedScroll(): void {
    if (!this.openPopupItem() || !this.popupAnchorEl) return;
    this.positionPopupFromAnchor();
  }

  private positionPopupFromAnchor(): void {
    if (!this.popupAnchorEl) return;
    const rect = this.popupAnchorEl.getBoundingClientRect();
    this.popupTop.set(rect.top);
    this.popupLeft.set(rect.right + 12);
  }

  private scheduleClosePopup(): void {
    this.clearClosePopupTimer();
    this.closePopupTimer = setTimeout(() => {
      if (!this.popupHovered) {
        this.closePopup();
      }
    }, 120);
  }

  private clearClosePopupTimer(): void {
    if (this.closePopupTimer) {
      clearTimeout(this.closePopupTimer);
      this.closePopupTimer = null;
    }
  }

  private closePopup(): void {
    this.openPopupItem.set(null);
    this.popupAnchorEl = null;
    this.popupHovered = false;
    this.clearClosePopupTimer();
  }

  isExpanded(item: SidebarItem): boolean {
    return this.expandedIds().has(item.id);
  }

  isItemActive(item: SidebarItem | null | undefined): boolean {
    if (!item) return false;

    if (item.route) {
      const urlTree = this._router.createUrlTree(
        Array.isArray(item.route) ? item.route : [item.route]
      );
      if (
        this._router.isActive(urlTree, {
          paths: 'subset',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored',
        })
      ) {
        return true;
      }
    }

    if (item.children?.length) {
      return item.children.some((child) => this.isItemActive(child));
    }

    return false;
  }

  trackById(_index: number, item: SidebarItem): string {
    return item.id;
  }

  private syncExpandedWithActive(): void {
    // Busca ruta activa automáticamente si no se provee desde fuera
    const path = this.findActivePath(this.items());
    if (!path.length) return;

    // Expande todos los padres del item activo
    // (menos el último, que es el item final)
    const parentIds = path.slice(0, -1).map((x) => x.id);

    const next = this.allowMultipleOpen()
      ? new Set(untracked(() => this.expandedIds()))
      : new Set<string>();
    parentIds.forEach((id) => next.add(id));
    this.expandedIds.set(next);
  }

  private getActiveParentIds(): Set<string> {
    const path = this.findActivePath(this.items());
    if (!path.length) return new Set<string>();
    return new Set(path.slice(0, -1).map((x) => x.id));
  }

  private findActivePath(items: SidebarItem[], trail: SidebarItem[] = []): SidebarItem[] {
    for (const item of items) {
      const nextTrail = [...trail, item];

      let isDirectActive = false;

      if (item.route) {
        const urlTree = this._router.createUrlTree(
          Array.isArray(item.route) ? item.route : [item.route]
        );

        isDirectActive = this._router.isActive(urlTree, {
          paths: 'exact',
          queryParams: 'ignored',
          fragment: 'ignored',
          matrixParams: 'ignored',
        });
      }

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
