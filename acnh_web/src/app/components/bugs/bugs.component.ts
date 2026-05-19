import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { TranslationService } from '../../services/translation.service';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bugs',
  imports: [FormsModule, RouterLink, CommonModule],
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

  // Usamos un Signal de Set para los favoritos (id_api)
  private bichosAgregadosIds = signal<Set<string>>(new Set());

  // Variables de búsqueda
  filtroNombre: string = '';
  nombreAplicado: string = '';
  ordenSeleccionado: string = 'NUM_ASC';

  // Constante para el tipo (Bichos = 1)
  private readonly TIPO_BICHO = 1;

  ngOnInit() {
    this.cargarFavoritos();

    this.nookipediaService.getCollectibles('bugs').subscribe({
      next: (data) => {
        this.bichos = data
          .map((b: any) => this.translationService.translateCollectible(b))
          .sort((a: any, b: any) => a.number - b.number);

          this.paginaActual = 1;
      },
      error: (err) => console.error('Error al cargar bichos', err),
    });

    const bugsTheme: PageThemeConfig = {
      light: {
        color: 'rgba(139, 195, 74, 0.98)',
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

  // --- FAVORITOS (BACKEND) ---

  private cargarFavoritos(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      this.usuarioService.getColeccionablesUsuarioPorTipo(usuario.id, this.TIPO_BICHO).subscribe({
        next: (favoritos) => {
          const ids = new Set(favoritos.map(f => f.id_api.toString()));
          this.bichosAgregadosIds.set(ids);
        }
      });
    }
  }

  esBichoAgregado(idApi: any): boolean {
    return this.bichosAgregadosIds().has(idApi.toString());
  }

  ponerAFavoritos(b: any): void {
    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    const idApi = b.number.toString(); // Usamos el número de la enciclopedia como ID único
    const yaAgregado = this.esBichoAgregado(idApi);

    if (yaAgregado) {
      // ELIMINAR
      this.usuarioService.deleteColeccionableUsuario(usuarioActual.id, idApi).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.bichosAgregadosIds.update(set => {
              const nuevo = new Set(set);
              nuevo.delete(idApi);
              return nuevo;
            });
          }
        }
      });
    } else {
      // AÑADIR
      const bichoData = {
        id_api: idApi,
        id_tipo: this.TIPO_BICHO,
        nombre: b.name,
        imagen: b.image_url // Guardamos la URL directa, sin cache local
      };

      this.usuarioService.createColeccionableUsuario(usuarioActual.id, bichoData).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.bichosAgregadosIds.update(set => {
              const nuevo = new Set(set);
              nuevo.add(idApi);
              return nuevo;
            });
          }
        }
      });
    }
  }

  // --- GETTERS Y FILTRADO ---

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

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
      case 'ASC': this.bichos.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'DESC': this.bichos.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'NUM_ASC': this.bichos.sort((a, b) => a.number - b.number); break;
      case 'NUM_DESC': this.bichos.sort((a, b) => b.number - a.number); break;
    }
  }

  get bichosAMostrar() {
    const filtrados = this.bichos.filter((b) =>
      b.name.toLowerCase().includes(this.nombreAplicado.toLowerCase()),
    );
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return filtrados.slice(inicio, inicio + this.itemsPorPagina);
  }
}