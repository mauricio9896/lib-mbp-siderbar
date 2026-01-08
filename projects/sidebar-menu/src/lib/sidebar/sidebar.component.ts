import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SidebarItem, SidebarTheme, SidebarThemeConfig } from './sidebar.types';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { applyThemeVariables } from './siderbar.theme';

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    MatRippleModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      state('void', style({ height: '0px', opacity: 0, overflow: 'hidden', display: 'none' })),
      state('*', style({ height: '*', opacity: 1, overflow: 'hidden', display: 'block' })),
      transition('void => *', [
        style({ height: '0px', opacity: 0, overflow: 'hidden', display: 'block' }),
        animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ height: '*', opacity: 1 })),
      ]),
      transition('* => void', [
        style({ height: '*', opacity: 1, overflow: 'hidden', display: 'block' }),
        animate('200ms ease-out', style({ height: '0px', opacity: 0 })),
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnChanges, OnInit {
  private _cdr = inject(ChangeDetectorRef);
  private _elementRef = inject(ElementRef);
  private _router = inject(Router);

  // variables requeridas
  @Input() title = 'Workspace';
  @Input() items: SidebarItem[] = [];
  @Input() logoUrl?: string;
  @Input() mobileOpen = false;

  // Opciones del siderbar para una configuracion mas perzonalida
  @Input() subtitle = 'Overview';
  @Input() theme: SidebarTheme = 'light';
  @Input() themeConfig?: SidebarThemeConfig;
  @Input() allowMultipleOpen = false;

  // salidas del siderbar
  @Output() mobileOpenChange = new EventEmitter<boolean>();
  @Output() itemSelected = new EventEmitter<SidebarItem>();

  get overlayThemeClass(): string {
    return `sidebar-theme-${this.theme}`;
  }

  //Variables
  public collapsed = false;
  private _destroy$ = new Subject<void>();
  private expandedIds = new Set<string>();

  constructor() {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this._cdr.markForCheck();
        this.syncExpandedWithActive();
      });
  }

  ngOnInit(): void {
    applyThemeVariables(this.theme, this._elementRef, this.themeConfig);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Auto-expand cuando cambien items
    if (changes['items']) {
      this.syncExpandedWithActive();
    }

    // Aplicar variables cuando cambia el tema o themeConfig
    if (changes['theme'] || changes['themeConfig']) {
      applyThemeVariables(this.theme, this._elementRef, this.themeConfig);
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;

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
    if (this.collapsed && item.children?.length) {
      event.preventDefault();
      return;
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

    this._cdr.markForCheck();
  }

  onSelect(item: SidebarItem, event?: Event): void {
    if (item.disabled) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

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
