import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-fish',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './fish.component.html',
  styleUrls: ['./fish.component.css']
})
export class FishComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private nookipediaService = inject(NookipediaService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private router = inject(Router);

  peces: any[] = [];
  paginaActual: number = 1;
  itemsPorPagina: number = 24;
  pecesAgregados: Set<string> = new Set();

  // Variables de búsqueda y ordenación
  filtroNombre: string = '';
  nombreAplicado: string = '';
  ordenSeleccionado: string = 'NUM_ASC';

  ngOnInit() {
    this.cargarPecesGuardados();

    // Llamada al servicio usando 'fish'
    this.nookipediaService.getCollectibles('fish').subscribe({
      next: (data) => {
        // Traducir y aplicar orden inicial por número de Critterpedia
        this.peces = data
          .map((f: any) => this.translationService.translateCollectible(f))
          .sort((a: any, b: any) => a.number - b.number);
        this.guardarImagenesPeces(this.peces);
      },
      error: (err) => console.error('Error al cargar peces', err),
    });

    // Configuración de tema para Peces
    const fishTheme: PageThemeConfig = {
      light: {
        color: 'rgb(217, 133, 126)', 
        bgHorizontal: '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-ykzms2d5yjh51HHHH.png',
        bgVertical: '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-i12piqc5yjh51L.png',
      },
      dark: {
        color: 'rgb(166, 81, 73)',
        bgHorizontal: '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-ykzms2d5yjh51.png',
        bgVertical: '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-i12piqc5yjh51.png',
      },
    };

    this.themeService.setPageTheme(fishTheme);
  }

  ngOnDestroy() {
    this.themeService.resetPageTheme();
  }

  // --- LÓGICA FILTRADO Y PAGINACIÓN ---

  get totalPaginas(): number {
    const filtrados = this.peces.filter((f) =>
      f.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
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
        this.peces.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'DESC':
        this.peces.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'NUM_ASC':
        this.peces.sort((a, b) => a.number - b.number);
        break;
      case 'NUM_DESC':
        this.peces.sort((a, b) => b.number - a.number);
        break;
    }
  }

  get pecesAMostrar() {
    const filtrados = this.peces.filter((f) =>
      f.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
    );
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return filtrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  // --- LÓGICA FAVORITOS Y CACHE ---

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  private guardarImagenesPeces(peces: any[]): void {
    const cache = sessionStorage.getItem('coleccionables_cache');
    const cacheObj = cache ? JSON.parse(cache) : {};

    peces.forEach((f) => {
      if (f.name && f.image_url) {
        cacheObj[f.name] = f.image_url;
      }
    });
    sessionStorage.setItem('coleccionables_cache', JSON.stringify(cacheObj));
  }

  private cargarPecesGuardados(): void {
    const agregados = sessionStorage.getItem('peces_agregados');
    if (agregados) {
      this.pecesAgregados = new Set(JSON.parse(agregados));
    }
  }

  esPezAgregado(nombre: string): boolean {
    return this.pecesAgregados.has(nombre);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  ponerAFavoritos(p: any): void {
    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) {
      this.redirectToLogin();
      return;
    }

    const pezNombre = p.name;
    if (this.esPezAgregado(pezNombre)) {
      this.pecesAgregados.delete(pezNombre);
      this.actualizarSessionStorage();
      return;
    }

    const pezData = {
      id_api: p.name,
      id_tipo: 2, // ID Tipo 2 para Peces
      nombre: p.name,
      imagen: p.image_url,
      fechaCaptura: new Date().toISOString(),
    };

    this.usuarioService
      .createColeccionableUsuario(usuarioActual.id, pezData)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.pecesAgregados.add(pezNombre);
            this.actualizarSessionStorage();
          }
        },
        error: (err) => console.error('Error al guardar pez', err),
      });
  }

  private actualizarSessionStorage(): void {
    sessionStorage.setItem(
      'peces_agregados',
      JSON.stringify(Array.from(this.pecesAgregados)),
    );
  }
}