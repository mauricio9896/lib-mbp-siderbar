import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SidebarItem, SidebarTheme } from './sidebar.types';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive, MatRippleModule, MatTooltipModule, MatMenuModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      state('void', style({ height: '0px', opacity: 0, overflow: 'hidden', display: 'none' })),
      state('*', style({ height: '*', opacity: 1, overflow: 'hidden', display: 'block' })),
      transition('void => *', [
        style({ height: '0px', opacity: 0, overflow: 'hidden', display: 'block' }),
        animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ height: '*', opacity: 1 }))
      ]),
      transition('* => void', [
        style({ height: '*', opacity: 1, overflow: 'hidden', display: 'block' }),
        animate('200ms ease-out', style({ height: '0px', opacity: 0 }))
      ])
    ])
  ]
})
export class SidebarComponent implements OnChanges {
  private _cdr = inject(ChangeDetectorRef);
  private _router = inject(Router);
  private _destroy$ = new Subject<void>();

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

  get overlayThemeClass(): string {
    return `sidebar-theme-${this.theme}`;
  }

  private expandedIds = new Set<string>();

  constructor() {
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this._destroy$)
    ).subscribe(() => {
      // Necesario para que isItemActive se reevalúe y la vista se actualice
      this._cdr.markForCheck();

      // Opcional: Expandir automáticamente al navegar
      this.syncExpandedWithActive();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

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

  onItemClick(item: SidebarItem, event: Event): void {
    // Si está colapsado y tiene submenú:
    // Dejamos que el evento burbujee para activar el MatMenuTrigger que está en el padre.
    // Solo prevenimos la navegación por defecto del enlace (href) para no saltar de página.
    if (this.collapsed && item.children?.length) {
      event.preventDefault();
      // IMPORTANTE: No usamos stopPropagation() aquí.
      return;
    }

    // Lógica estándar cuando no está colapsado
    if (item.children?.length) {
        // En modo expandido, toggle del acordeón
        this.toggleItem(item, event);
    } else {
        // Ítem hoja o enlace directo
        this.onSelect(item, event);
    }
  }

  toggleItem(item: SidebarItem, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation(); // Mantiene el comportamiento de acordeón aislado

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

    // Forzar actualización de vista para animaciones
    this._cdr.markForCheck();
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

    // 3) Activo automático por Router si tiene route
    if (item.route) {
        const urlTree = this._router.createUrlTree(Array.isArray(item.route) ? item.route : [item.route]);
        // paths: 'subset' permite que /analytics esté activo si estás en /analytics/reports (si lo deseas)
        // o 'exact' para coincidencia exacta. Usualmente para menús subset es mejor.
        if (this._router.isActive(urlTree, { paths: 'subset', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' })) {
            return true;
        }
    }

    // 4) Activo si alguno de sus hijos está activo
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
    const path = this.findActivePath(this.items);
    if (!path.length) return;

    // Expande todos los padres del item activo
    // (menos el último, que es el item final)
    const parentIds = path.slice(0, -1).map((x) => x.id);

    if (!this.allowMultipleOpen) {
      this.expandedIds.clear();
    }

    parentIds.forEach((id) => this.expandedIds.add(id));
    this._cdr.markForCheck();
  }

  private findActivePath(items: SidebarItem[], trail: SidebarItem[] = []): SidebarItem[] {
    for (const item of items) {
      const nextTrail = [...trail, item];

      let isDirectActive = false;

      // Chequeo manual
      if ((this.activeItemId && item.id === this.activeItemId) ||
          (this.activeRoute && (item.route === this.activeRoute || item.url === this.activeRoute))) {
          isDirectActive = true;
      }
      // Chequeo router automático
      else if (item.route) {
          const urlTree = this._router.createUrlTree(Array.isArray(item.route) ? item.route : [item.route]);
          // Usamos 'exact' para encontrar el nodo hoja exacto,
          // o 'subset' si queremos expandir hasta el padre más cercano
          isDirectActive = this._router.isActive(urlTree, { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
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
