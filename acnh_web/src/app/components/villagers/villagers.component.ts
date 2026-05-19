import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { MOCK_VILLAGERS } from './villagers.mock';
import { TranslationService } from '../../services/translation.service';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-villagers',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './villagers.component.html',
  styleUrl: './villagers.component.css',
})
export class VillagersComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private nookipediaService = inject(NookipediaService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  aldeanos: any[] = []; // Aquí se guarda lo que llega de la API
  paginaActual: number = 1;
  itemsPorPagina: number = 24;
  especies: string[] = [];
  private aldeanosAgregadosIds = signal<Set<string>>(new Set()); // Para rastrear aldeanos ya agregados

  ngOnInit() {
    this.especies = this.translationService.getAvailableSpecies();
    this.cargarFavoritosDelUsuario();

    this.nookipediaService.getVillagers().subscribe({
      next: (data) => {
        // Ordenamos alfabéticamente por el nombre (que ya viene traducido del servicio)
        this.aldeanos = data.sort((a: any, b: any) =>
          a.name.localeCompare(b.name),
        );
      },
      error: (err) => {
        console.error('API Caída, cargando mocks...', err);
        // Si la API falla, usamos mocks traducidos para que los signos zodiacales y los iconos funcionen.
        this.aldeanos = MOCK_VILLAGERS.map((v: any) =>
          this.translationService.translateVillager(v),
        ).sort((a: any, b: any) => a.name.localeCompare(b.name));
      },
    });

    const villagersTheme: PageThemeConfig = {
      light: {
        color: 'rgba(73, 208, 195, 0.98)',
        bgHorizontal: '/assets/ISMI2.jpg',
        bgVertical: '/assets/IMG_1967.JPG',
      },
      dark: {
        color: 'rgba(66, 195, 182, 0.47)',
        bgHorizontal: '/assets/ISMI.png',
        bgVertical: '/assets/img-1967-dark.png',
      },
    };

    // Aplicamos el tema
    this.themeService.setPageTheme(villagersTheme);
  }

  ngOnDestroy() {
    // Limpiamos al salir de la ruta
    this.themeService.resetPageTheme();
  }

  private cargarFavoritosDelUsuario(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario && usuario.id) {
      this.usuarioService.getAldeanosUsuario(usuario.id).subscribe({
        next: (aldeanosBackend) => {
          // Extraemos los id_api y los guardamos en el Set del Signal
          const ids = new Set(aldeanosBackend.map((a) => a.id_api.toString()));
          this.aldeanosAgregadosIds.set(ids);
        },
        error: (err) =>
          console.error('Error cargando favoritos del backend', err),
      });
    }
  }

  //PAGINADOR

  get totalPaginas(): number {
    // Usamos las variables "Aplicadas" para que coincida con lo que se ve en pantalla
    const filtrados = this.aldeanos.filter((v) => {
      const cumpleNombre = v.name
        .toLowerCase()
        .includes(this.nombreAplicado.toLowerCase());
      const cumpleEspecie =
        this.especieAplicada === '' || v.species === this.especieAplicada;
      return cumpleNombre && cumpleEspecie;
    });

    const total = Math.ceil(filtrados.length / this.itemsPorPagina);
    return total > 0 ? total : 1; // Evitamos que devuelva 0 páginas
  }

  cambiarPagina(nuevaPagina: number) {
    this.paginaActual = nuevaPagina;
    // Scroll hacia arriba al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // BUSCADOR

  private translationService = inject(TranslationService);

  // Variables de modelo (lo que el usuario toca)
  filtroNombre: string = '';
  especieSeleccionada: string = '';

  // Variables de aplicación (lo que se filtra tras pulsar "Buscar")
  nombreAplicado: string = '';
  especieAplicada: string = '';

  /**
   * Verificar si el usuario está logueado
   */
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  buscar() {
    this.nombreAplicado = this.filtroNombre;
    this.especieAplicada = this.especieSeleccionada;
    this.paginaActual = 1;
  }

  get aldeanosAMostrar() {
    const filtrados = this.aldeanos.filter((v) => {
      const cumpleNombre = v.name
        .toLowerCase()
        .includes(this.nombreAplicado.toLowerCase());
      const cumpleEspecie =
        this.especieAplicada === '' || v.species === this.especieAplicada;
      return cumpleNombre && cumpleEspecie;
    });

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return filtrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  /**
   * Verificar si un aldeano ya fue agregado
   */
  esAldeanoAgregado(aldeanoId: string): boolean {
    return this.aldeanosAgregadosIds().has(aldeanoId.toString());
  }

  /**
   * Añade o elimina un aldeano de favoritos sincronizando con el backend
   * @param v Objeto del aldeano (proviene de Nookipedia)
   */
  ponerAFavoritos(v: any): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) return;

    const aldeanoIdApi = v.id.toString();
    const yaAgregado = this.esAldeanoAgregado(aldeanoIdApi);

    if (yaAgregado) {
      // --- LÓGICA PARA ELIMINAR ---
      this.usuarioService
        .deleteAldeanoUsuario(usuarioActual.id, aldeanoIdApi)
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              // Actualizamos el Signal de IDs para que el corazón se vacíe en la UI
              this.removerFavoritoLocal(aldeanoIdApi);
              console.log('Eliminado de favoritos:', v.name);
            } else {
              console.error('Error al eliminar:', response.message);
            }
          },
          error: (err) =>
            console.error('Error en la solicitud de borrado', err),
        });
    } else {
      // --- LÓGICA PARA AÑADIR ---
      const aldeanoData = {
        id_api: aldeanoIdApi,
        url_api: 'https://api.nookipedia.com/villagers',
        nombre_aldeano: v.name,
        imagen_aldeano: v.image_url,
        personalidad: v.personality,
      };

      this.usuarioService
        .createAldeanoUsuario(usuarioActual.id, aldeanoData)
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              // Actualizamos el Signal local para que el corazón se rellene inmediatamente
              this.aldeanosAgregadosIds.update((set) => {
                const nuevoSet = new Set(set);
                nuevoSet.add(aldeanoIdApi);
                return nuevoSet;
              });
              console.log('Añadido a favoritos:', v.name);
            } else {
              console.error('Error al añadir:', response.message);
            }
          },
          error: (err) =>
            console.error('Error en la solicitud de creación', err),
        });
    }
  }

  /**
   * Método auxiliar para actualizar el estado del Signal al eliminar
   * @param aldeanoIdApi ID de la API a eliminar del Set
   */
  private removerFavoritoLocal(aldeanoIdApi: string): void {
    this.aldeanosAgregadosIds.update((set) => {
      const nuevoSet = new Set(set);
      nuevoSet.delete(aldeanoIdApi);
      return nuevoSet;
    });
  }
}
