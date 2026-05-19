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
  selector: 'app-sea-creatures',
  imports: [FormsModule, RouterLink, CommonModule],
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

  // Signal para gestionar favoritos de forma reactiva
  private criaturasAgregadasIds = signal<Set<string>>(new Set());

  // Variables de búsqueda y ordenación
  filtroNombre: string = '';
  nombreAplicado: string = '';
  ordenSeleccionado: string = 'NUM_ASC';

  // Constante para el tipo (Criaturas Marinas = 3)
  private readonly TIPO_MARINA = 3;

  ngOnInit() {
    this.cargarFavoritos();

    this.nookipediaService.getCollectibles('sea').subscribe({
      next: (data) => {
        this.criaturas = data
          .map((f: any) => this.translationService.translateCollectible(f))
          .sort((a: any, b: any) => a.number - b.number);
      },
      error: (err) => console.error('Error al cargar criaturas marinas', err),
    });

    const seaTheme: PageThemeConfig = {
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
    this.themeService.setPageTheme(seaTheme);
  }

  ngOnDestroy() {
    this.themeService.resetPageTheme();
  }

  // --- LÓGICA FAVORITOS (SIN SESSIONSTORAGE) ---

  private cargarFavoritos(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      this.usuarioService.getColeccionablesUsuarioPorTipo(usuario.id, this.TIPO_MARINA).subscribe({
        next: (favoritos) => {
          // Guardamos los id_api de la base de datos en el Set del Signal
          const ids = new Set(favoritos.map(f => f.id_api.toString()));
          this.criaturasAgregadasIds.set(ids);
        },
        error: (err) => console.error('Error cargando favoritos marinos', err)
      });
    }
  }

  esCriaturaAgregada(idApi: any): boolean {
    return this.criaturasAgregadasIds().has(idApi.toString());
  }

  ponerAFavoritos(c: any): void {
    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    const idApi = c.number.toString();
    const yaAgregado = this.esCriaturaAgregada(idApi);

    if (yaAgregado) {
      // ELIMINAR DE LA BASE DE DATOS
      this.usuarioService.deleteColeccionableUsuario(usuarioActual.id, idApi).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.criaturasAgregadasIds.update(set => {
              const nuevo = new Set(set);
              nuevo.delete(idApi);
              return nuevo;
            });
          }
        }
      });
    } else {
      // AÑADIR A LA BASE DE DATOS
      const criaturaData = {
        id_api: idApi,
        id_tipo: this.TIPO_MARINA,
        nombre: c.name,
        imagen: c.image_url // URL directa de la API
      };

      this.usuarioService.createColeccionableUsuario(usuarioActual.id, criaturaData).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.criaturasAgregadasIds.update(set => {
              const nuevo = new Set(set);
              nuevo.add(idApi);
              return nuevo;
            });
          }
        }
      });
    }
  }

  // --- LÓGICA FILTRADO Y PAGINACIÓN ---

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

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
      case 'ASC': this.criaturas.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'DESC': this.criaturas.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'NUM_ASC': this.criaturas.sort((a, b) => a.number - b.number); break;
      case 'NUM_DESC': this.criaturas.sort((a, b) => b.number - a.number); break;
    }
  }

  get criaturasAMostrar() {
    const filtrados = this.criaturas.filter((c) =>
      c.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
    );
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return filtrados.slice(inicio, inicio + this.itemsPorPagina);
  }
}