import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { SidebarTheme } from '../sidebar/sidebar.types';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setTheme(theme: SidebarTheme): void {
    const root = document.documentElement;
    this.renderer.setAttribute(root, 'data-sidebar-theme', theme);
  }
}
