import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fish',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './fish.component.html',
  styleUrls: ['./fish.component.css'],
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

  // Signal para manejar los favoritos de forma reactiva
  private pecesAgregadosIds = signal<Set<string>>(new Set());

  // Variables de búsqueda y ordenación
  filtroNombre: string = '';
  nombreAplicado: string = '';
  ordenSeleccionado: string = 'NUM_ASC';

  // Constante para el tipo (Peces = 2)
  private readonly TIPO_PEZ = 2;

  ngOnInit() {
    this.cargarFavoritos();

    this.nookipediaService.getCollectibles('fish').subscribe({
      next: (data) => {
        this.peces = data
          .map((f: any) => this.translationService.translateCollectible(f))
          .sort((a: any, b: any) => a.number - b.number);
      },
      error: (err) => console.error('Error al cargar peces', err),
    });

    const fishTheme: PageThemeConfig = {
      light: {
        color: 'rgb(217, 133, 126)',
        bgHorizontal:
          '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-ykzms2d5yjh51HHHH.png',
        bgVertical:
          '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-i12piqc5yjh51L.png',
      },
      dark: {
        color: 'rgb(166, 81, 73)',
        bgHorizontal:
          '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-ykzms2d5yjh51.png',
        bgVertical:
          '/assets/remember-those-my-nintendo-wallpapers-i-made-them-dark-mode-v0-i12piqc5yjh51.png',
      },
    };
    this.themeService.setPageTheme(fishTheme);
  }

  ngOnDestroy() {
    this.themeService.resetPageTheme();
  }

  // --- LÓGICA DE FAVORITOS (BACKEND) ---

  private cargarFavoritos(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      this.usuarioService
        .getColeccionablesUsuarioPorTipo(usuario.id, this.TIPO_PEZ)
        .subscribe({
          next: (favoritos) => {
            // Guardamos los id_api como strings en el Set
            const ids = new Set(favoritos.map((f) => f.id_api.toString()));
            this.pecesAgregadosIds.set(ids);
          },
          error: (err) =>
            console.error('Error cargando favoritos de peces', err),
        });
    }
  }

  esPezAgregado(idApi: any): boolean {
    return this.pecesAgregadosIds().has(idApi.toString());
  }

  ponerAFavoritos(p: any): void {
    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    const idApi = p.number.toString();
    const yaAgregado = this.esPezAgregado(idApi);

    if (yaAgregado) {
      // ELIMINAR
      this.usuarioService
        .deleteColeccionableUsuario(usuarioActual.id, idApi)
        .subscribe({
          next: (res) => {
            if (res.status === 'success') {
              this.pecesAgregadosIds.update((set) => {
                const nuevo = new Set(set);
                nuevo.delete(idApi);
                return nuevo;
              });
            }
          },
        });
    } else {
      // AÑADIR
      const pezData = {
        id_api: idApi,
        id_tipo: this.TIPO_PEZ,
        nombre: p.name,
        imagen: p.image_url, // Usamos la URL directa de la API
      };

      this.usuarioService
        .createColeccionableUsuario(usuarioActual.id, pezData)
        .subscribe({
          next: (res) => {
            if (res.status === 'success') {
              this.pecesAgregadosIds.update((set) => {
                const nuevo = new Set(set);
                nuevo.add(idApi);
                return nuevo;
              });
            }
          },
        });
    }
  }

  // --- GETTERS, FILTRADO Y ORDENACIÓN ---

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

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
}
