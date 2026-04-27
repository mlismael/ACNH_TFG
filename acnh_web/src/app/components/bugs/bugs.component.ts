import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { TranslationService } from '../../services/translation.service';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bugs',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './bugs.component.html',
  styleUrl: './bugs.component.css',
})
export class BugsComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private nookipediaService = inject(NookipediaService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private router = inject(Router);

  bichos: any[] = [];
  paginaActual: number = 1;
  itemsPorPagina: number = 24;
  bichosAgregados: Set<string> = new Set();

  // Variables de búsqueda
  filtroNombre: string = '';
  nombreAplicado: string = '';
  ordenSeleccionado: string = 'NUM_ASC';

  ngOnInit() {
    this.cargarBichosGuardados();

    // Llamada correcta al servicio usando 'bugs'
    this.nookipediaService.getCollectibles('bugs').subscribe({
      next: (data) => {
        // 1. Traducir y luego ordenar por número de entrada
        this.bichos = data
          .map((b: any) => this.translationService.translateCollectible(b))
          .sort((a: any, b: any) => a.number - b.number);
        this.guardarImagenesBichos(this.bichos);
      },
      error: (err) => console.error('Error al cargar bichos', err),
    });

    const bugsTheme: PageThemeConfig = {
      light: {
        color: 'rgba(139, 195, 74, 0.98)', // Un verde más "insecto"
        bgHorizontal: '/assets/patterned-animal-crossing-new-horizons-wallpaper-from-my-v0-qfpmdswuca461.jpg',
        bgVertical: '/assets/fd25e7404aae302bb54bba5d4ff13ace.jpg',
      },
      dark: {
        color: 'rgba(85, 139, 47, 0.47)',
        bgHorizontal: '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-ykzms2d5yjh51.png',
        bgVertical: '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-i12piqc5yjh51.png',
      },
    };

    this.themeService.setPageTheme(bugsTheme);
  }

  ngOnDestroy() {
    this.themeService.resetPageTheme();
  }

  // --- LÓGICA FILTRADO Y PAGINACIÓN ---

  get totalPaginas(): number {
    const filtrados = this.bichos.filter((b) =>
      b.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
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
      this.bichos.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'DESC':
      this.bichos.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'NUM_ASC':
      this.bichos.sort((a, b) => a.number - b.number);
      break;
    case 'NUM_DESC':
      this.bichos.sort((a, b) => b.number - a.number);
      break;
  }
}

  get bichosAMostrar() {
    const filtrados = this.bichos.filter((b) =>
      b.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
    );
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return filtrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  // --- LÓGICA FAVORITOS Y CACHE ---

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  private guardarImagenesBichos(bichos: any[]): void {
    const cache = sessionStorage.getItem('coleccionables_cache');
    const cacheObj = cache ? JSON.parse(cache) : {};

    bichos.forEach((b) => {
      if (b.name && b.image_url) {
        // Guardamos por nombre o ID según tu lógica de "Mi Isla"
        cacheObj[b.name] = b.image_url;
      }
    });
    sessionStorage.setItem('coleccionables_cache', JSON.stringify(cacheObj));
  }

  private cargarBichosGuardados(): void {
    const agregados = sessionStorage.getItem('bichos_agregados');
    if (agregados) {
      this.bichosAgregados = new Set(JSON.parse(agregados));
    }
  }

  esBichoAgregado(nombre: string): boolean {
    return this.bichosAgregados.has(nombre);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  ponerAFavoritos(b: any): void {
    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) {
      this.redirectToLogin();
      return;
    }

    const bichoNombre = b.name;
    if (this.esBichoAgregado(bichoNombre)) {
      this.bichosAgregados.delete(bichoNombre);
      this.actualizarSessionStorage();
      return;
    }

    const bichoData = {
      id_api: b.name, // O el ID si la API lo da
      id_tipo: 1, // Asumimos Tipo 1 para Bichos
      nombre: b.name,
      imagen: b.image_url,
      fechaCaptura: new Date().toISOString(),
    };

    this.usuarioService
      .createColeccionableUsuario(usuarioActual.id, bichoData)
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.bichosAgregados.add(bichoNombre);
            this.actualizarSessionStorage();
          }
        },
        error: (err) => console.error('Error al guardar bicho', err),
      });
  }

  private actualizarSessionStorage(): void {
    sessionStorage.setItem(
      'bichos_agregados',
      JSON.stringify(Array.from(this.bichosAgregados)),
    );
  }
}
