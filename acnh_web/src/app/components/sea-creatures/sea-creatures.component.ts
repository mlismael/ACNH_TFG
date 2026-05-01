import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-sea-creatures',
  imports: [ FormsModule, RouterLink], 
  templateUrl: './sea-creatures.component.html',
  styleUrl: './sea-creatures.component.css'
})
export class SeaCreaturesComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private nookipediaService = inject(NookipediaService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private router = inject(Router);

  criaturas: any[] = [];
  paginaActual: number = 1;
  itemsPorPagina: number = 24;
  criaturasAgregadas: Set<string> = new Set();

  // Variables de búsqueda y ordenación
  filtroNombre: string = '';
  nombreAplicado: string = '';
  ordenSeleccionado: string = 'NUM_ASC';

  ngOnInit() {
    this.cargarCriaturasGuardadas();

    // Llamada al servicio usando 'sea-creatures'
    this.nookipediaService.getCollectibles('sea').subscribe({
      next: (data) => {
        // Traducir y aplicar orden inicial por número de Critterpedia
        this.criaturas = data
          .map((f: any) => this.translationService.translateCollectible(f))
          .sort((a: any, b: any) => a.number - b.number);
        this.guardarImagenesCriaturas(this.criaturas);
      },
      error: (err) => console.error('Error al cargar criaturas marinas', err),
    });

    // Configuración de tema para Peces
    const fishTheme: PageThemeConfig = {
      light: {
        color: 'rgb(126, 143, 217)', 
        bgHorizontal: '/assets/Animal_Crossing_New_Horizons_2026_wallpaper_azul_blanco_horizontal.png',
        bgVertical: '/assets/Animal_Crossing_New_Horizons_2026_wallpaper_blanco-azul-vertical.png',
      },
      dark: {
        color: 'rgba(71, 97, 210, 0.55)',
        bgHorizontal: '/assets/fondo_oscuro_horizontal_maritimo.png',
        bgVertical: '/assets/fondo_maritimo_oscuro.png',
      },
    };

    this.themeService.setPageTheme(fishTheme);
  }

  ngOnDestroy() {
    this.themeService.resetPageTheme();
  }

  // --- LÓGICA FILTRADO Y PAGINACIÓN ---

  get totalPaginas(): number {
    const filtrados = this.criaturas.filter((c) =>
      c.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
    );
    return Math.ceil(filtrados.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(nuevaPagina: number) {
    this.paginaActual = nuevaPagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  buscar() {
    this.nombreAplicado = this.filtroNombre;
    this.paginaActual = 1;
  }

  ordenar() {
    switch (this.ordenSeleccionado) {
      case 'ASC':
        this.criaturas.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'DESC':
        this.criaturas.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'NUM_ASC':
        this.criaturas.sort((a, b) => a.number - b.number);
        break;
      case 'NUM_DESC':
        this.criaturas.sort((a, b) => b.number - a.number);
        break;
    }
  }

  get criaturasAMostrar() {
    const filtrados = this.criaturas.filter((c) =>
      c.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
    );
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return filtrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  // --- LÓGICA FAVORITOS Y CACHE ---

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  private guardarImagenesCriaturas(criaturas: any[]): void {
    const cache = sessionStorage.getItem('coleccionables_cache');
    const cacheObj = cache ? JSON.parse(cache) : {};

    criaturas.forEach((c) => {
      if (c.name && c.image_url) {
        cacheObj[c.name] = c.image_url;
      }
    });
    sessionStorage.setItem('coleccionables_cache', JSON.stringify(cacheObj));
  }

  private cargarCriaturasGuardadas(): void {
    const agregados = sessionStorage.getItem('criaturas_agregadas');
    if (agregados) {
      this.criaturasAgregadas = new Set(JSON.parse(agregados));
    }
  }

  esCriaturaAgregada(nombre: string): boolean {
    return this.criaturasAgregadas.has(nombre);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  ponerAFavoritos(c: any): void {
    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) {
      this.redirectToLogin();
      return;
    }

    const criaturaNombre = c.name;
    if (this.esCriaturaAgregada(criaturaNombre)) {
      this.criaturasAgregadas.delete(criaturaNombre);
      this.actualizarSessionStorage();
      return;
    }

    const criaturaData = {
      id_api: c.name,
      id_tipo: 2, // ID Tipo 2 para Peces
      nombre: c.name,
      imagen: c.image_url,
      fechaCaptura: new Date().toISOString(),
    };

    this.usuarioService
      .createColeccionableUsuario(usuarioActual.id, criaturaData)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.criaturasAgregadas.add(criaturaNombre);
            this.actualizarSessionStorage();
          }
        },
        error: (err) => console.error('Error al guardar pez', err),
      });
  }

  private actualizarSessionStorage(): void {
    sessionStorage.setItem(
      'criaturas_agregadas',
      JSON.stringify(Array.from(this.criaturasAgregadas)),
    );
  }
}