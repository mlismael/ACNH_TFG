// src/app/services/theme.service.ts
import { Injectable, signal, effect } from '@angular/core';

export interface PageThemeConfig {
  light: { color: string; bgHorizontal: string; bgVertical: string };
  dark: { color: string; bgHorizontal: string; bgVertical: string };
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  darkMode = signal<boolean>(this.getInitialTheme());

  // Guardamos la configuración actual de la página en la que estamos
  private currentTheme = signal<PageThemeConfig | null>(null);

  constructor() {
    // Este effect es la magia: se ejecuta solo cada vez que cambia el modo oscuro o la página
    // theme.service.ts
    effect(() => {
      const isDark = this.darkMode();
      const theme = this.currentTheme();

      // Aplicamos el atributo de Bootstrap para el tema global
      document.documentElement.setAttribute(
        'data-bs-theme',
        isDark ? 'dark' : 'light',
      );

      if (theme) {
        // Seleccionamos colores según el modo activo
        const colorActual = isDark ? theme.dark.color : theme.light.color;
        const colorInverso = isDark ? theme.light.color : theme.dark.color;

        // Inyectamos variables CSS de tema
        document.documentElement.style.setProperty(
          '--theme-color',
          colorActual,
        );
        document.documentElement.style.setProperty(
          '--inverse-theme-color',
          colorInverso,
        );

        // Ajustamos el color del texto para contraste
        const isLightColor = this.isColorLight(colorActual);
        const headerTextColor = isLightColor ? '#212529' : '#f8f9fa'; // Oscuro si fondo claro, claro si fondo oscuro
        document.documentElement.style.setProperty(
          '--header-text',
          headerTextColor,
        );

        // Actualizamos las imágenes de fondo según el tema
        const configImg = isDark ? theme.dark : theme.light;
        document.documentElement.style.setProperty(
          '--bg-horizontal',
          `url('${configImg.bgHorizontal}')`,
        );
        document.documentElement.style.setProperty(
          '--bg-vertical',
          `url('${configImg.bgVertical}')`,
        );
      }
    });
  }

  // Función para determinar si un color es claro u oscuro
  private isColorLight(color: string): boolean {
    // Remover # si existe
    const hex = color.replace('#', '');

    // Convertir a RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calcular luminancia (fórmula estándar)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si > 0.5 es claro, sino oscuro
    return luminance > 0.5;
  }

  /**
   * Determina si debe empezar en modo oscuro (8 PM a 8 AM hora Madrid)
   */
  private getInitialTheme(): boolean {
    const madridTime = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid',
      hour: 'numeric',
      hour12: false
    }).format(new Date());

    const hour = parseInt(madridTime, 10);

    // Si la hora está entre las 20 (8pm) y las 7:59 (8am)
    return hour >= 20 || hour < 8;
  }

  toggleDarkMode() {
    this.darkMode.update((v) => !v);
  }

  // El componente llama a esto en su ngOnInit
  setPageTheme(config: PageThemeConfig) {
    this.currentTheme.set(config);
  }

  // El componente llama a esto en su ngOnDestroy para limpiar
  resetPageTheme() {
    this.currentTheme.set(null);
    document.documentElement.style.removeProperty('--theme-color');
    document.documentElement.style.removeProperty('--inverse-theme-color');
    document.documentElement.style.removeProperty('--header-text');
    document.documentElement.style.removeProperty('--bg-horizontal');
    document.documentElement.style.removeProperty('--bg-vertical');
  }
}
