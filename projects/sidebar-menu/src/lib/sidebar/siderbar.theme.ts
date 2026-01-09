import { ElementRef } from '@angular/core';
import { SidebarLayout, SidebarTheme, SidebarThemeColors, SidebarThemeConfig } from './sidebar.types';

/**
 * Valores por defecto en los temas
 * Si no hay themeConfig, usa los valores por defecto.
 */
const DEFAULT_LIGHT_THEME: SidebarThemeColors = {
  bg: '#ffffff',
  text: '#4b5563',
  textSecondary: '#6b7280',
  activeBg: '#eff6ff',
  activeText: '#2563eb',
  hoverBg: '#f3f4f6',
  border: '#e5e7eb',
};

const DEFAULT_DARK_THEME: SidebarThemeColors = {
  bg: '#101218',
  text: '#f5f6f8',
  textSecondary: '#a8acb8',
  activeBg: 'rgba(75, 108, 255, 0.16)',
  activeText: '#ffffff',
  hoverBg: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(255, 255, 255, 0.08)',
};

const DEFAULT_LAYOUT: SidebarLayout = {
  width: '280px',
  radius: '12px',
  radiusItem: '4px',
  align: 'center',
  lessHeight: '40px',
};

/**
 * Aplica las variables CSS customizadas según el tema actual.
 * Si no hay themeConfig, usa los valores por defecto.
 */
export function applyThemeVariables(theme: SidebarTheme, _elementRef: ElementRef<any>, themeConfig?: SidebarThemeConfig): void {
  const host = _elementRef.nativeElement;

  // Merge con temas por defecto
  const lightTheme = { ...DEFAULT_LIGHT_THEME, ...themeConfig?.light };
  const darkTheme = { ...DEFAULT_DARK_THEME, ...themeConfig?.dark };
  const layout = { ...DEFAULT_LAYOUT, ...themeConfig?.layout };

  // Determinar qué tema aplicar según this.theme
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  // Aplicar variables del tema actual en el host
  setCSSVar(host, '--sidebar-bg', currentTheme.bg);
  setCSSVar(host, '--sidebar-text', currentTheme.text);
  setCSSVar(host, '--sidebar-text-secondary', currentTheme.textSecondary);
  setCSSVar(host, '--sidebar-active-bg', currentTheme.activeBg);
  setCSSVar(host, '--sidebar-active-text', currentTheme.activeText);
  setCSSVar(host, '--sidebar-hover-bg', currentTheme.hoverBg);
  setCSSVar(host, '--sidebar-border', currentTheme.border);

  // Aplicar variables de layout
  setCSSVar(host, '--sidebar-width', layout.width);
  setCSSVar(host, '--sidebar-radius', layout.radius);
  setCSSVar(host, '--sidebar-radius-item', layout.radiusItem);
  setCSSVar(host, '--sidebar-align', layout.align);
  setCSSVar(host, '--sidebar-less-height', layout.lessHeight);

  // Variables derivadas
  setCSSVar(host, '--sidebar-icon', currentTheme.text);
  setCSSVar(host, '--sidebar-icon-active', currentTheme.activeText);

  // Aplicar clase de tema en body para overlays (tooltips, menús)
  const themeClass = `sidebar-theme-${theme}`;
  document.body.classList.remove('sidebar-theme-light', 'sidebar-theme-dark');
  document.body.classList.add(themeClass);

  // Si hay customización, aplicar variables CSS personalizadas en body
  if (themeConfig) {
    // Crear elemento style o actualizar si existe
    let styleEl = document.getElementById('sidebar-overlay-theme') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'sidebar-overlay-theme';
      document.head.appendChild(styleEl);
    }

    // Generar CSS para overlays con valores customizados
    styleEl.textContent = `
        .sidebar-theme-${theme} .sidebar-tooltip,
        .sidebar-theme-${theme} .sidebar-popup-menu {
          --sidebar-bg: ${currentTheme.bg} !important;
          --sidebar-text: ${currentTheme.text} !important;
          --sidebar-text-secondary: ${currentTheme.textSecondary} !important;
          --sidebar-active-text: ${currentTheme.activeText} !important;
          --sidebar-active-bg: ${currentTheme.activeBg} !important;
          --sidebar-hover-bg: ${currentTheme.hoverBg} !important;
          --sidebar-border: ${currentTheme.border} !important;
          --sidebar-icon: ${currentTheme.text} !important;
          --sidebar-icon-active: ${currentTheme.activeText} !important;
        }
      `;
  }
}

/**
 * Establece una variable CSS en el elemento host.
 */
function setCSSVar(element: HTMLElement, property: string, value: string | undefined): void {
  if (value) {
    element.style.setProperty(property, value);
  }
}
