import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SidebarItem } from '../sidebar.types';

export type SidebarPopupSelectEvent = {
  item: SidebarItem | null;
  event?: Event;
};

@Component({
  selector: 'lib-sidebar-collapsed-popup',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './sidebar-collapsed-popup.component.html',
  styleUrl: './sidebar-collapsed-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarCollapsedPopupComponent {
  readonly openItem = input<SidebarItem | null>(null);
  readonly top = input(0);
  readonly left = input(0);
  readonly isItemActiveFn = input<((item: SidebarItem | null | undefined) => boolean) | null>(
    null
  );

  readonly popupEnter = output<void>();
  readonly popupLeave = output<void>();
  readonly itemSelect = output<SidebarPopupSelectEvent>();

  emitSelect(item: SidebarItem | null, event?: Event): void {
    this.itemSelect.emit({ item, event });
  }

  isActive(item: SidebarItem | null | undefined): boolean {
    const isActiveFn = this.isItemActiveFn();
    return isActiveFn ? isActiveFn(item) : false;
  }

  trackById(_index: number, item: SidebarItem): string {
    return item.id;
  }
}
