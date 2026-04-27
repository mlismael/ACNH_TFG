// src/app/pages/villagers/villagers.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { MOCK_VILLAGERS } from './villagers.mock';
import { TranslationService } from '../../services/translation.service';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-villagers',
  standalone: true, // Asegúrate de tener esto si usas Angular moderno
  imports: [FormsModule, RouterLink],
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
  aldeanosAgregados: Set<string> = new Set(); // Para rastrear aldeanos ya agregados

  ngOnInit() {
    this.especies = this.translationService.getAvailableSpecies();
    this.cargarAldeanosGuardados();

    this.nookipediaService.getVillagers().subscribe({
      next: (data) => {
        // Ordenamos alfabéticamente por el nombre (que ya viene traducido del servicio)
        this.aldeanos = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        this.guardarImagenesAldeanos(this.aldeanos);
      },
      error: (err) => {
        console.error('API Caída, cargando mocks...', err);
        // También ordenamos los Mocks por si acaso
        this.aldeanos = MOCK_VILLAGERS.sort((a: any, b: any) => a.name.localeCompare(b.name));
      },
    });

    const villagersTheme: PageThemeConfig = {
      light: {
        color: 'rgba(73, 208, 195, 0.98)',
        bgHorizontal: '/assets/ISMI2.jpg',
        bgVertical: '/assets/IMG_1967.JPG'
      },
      dark: {
        color: 'rgba(66, 195, 182, 0.47)',
        bgHorizontal: '/assets/ISMI.png',
        bgVertical: '/assets/img-1967-dark.png'
      }
    };

    // Aplicamos el tema
    this.themeService.setPageTheme(villagersTheme);
  }

  ngOnDestroy() {
    // Limpiamos al salir de la ruta
    this.themeService.resetPageTheme();
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
    // Truco: scroll hacia arriba suave para que el usuario vea el principio de la nueva lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  //BUSCADOR

  // En tu VillagersComponent
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
   * Guardar imágenes de todos los aldeanos en sessionStorage
   * Se guardan bajo la clave "aldeanos_cache" con estructura { id_api: url_image }
   */
  private guardarImagenesAldeanos(aldeanos: any[]): void {
    const cache = sessionStorage.getItem('aldeanos_cache');
    const aldeanosCache = cache ? JSON.parse(cache) : {};

    aldeanos.forEach((aldeano) => {
      if (aldeano.id && aldeano.image_url) {
        aldeanosCache[aldeano.id] = aldeano.image_url;
      }
    });

    sessionStorage.setItem('aldeanos_cache', JSON.stringify(aldeanosCache));
  }

  /**
   * Cargar aldeanos agregados del usuario desde sessionStorage
   */
  private cargarAldeanosGuardados(): void {
    const agregados = sessionStorage.getItem('aldeanos_agregados');
    if (agregados) {
      const lista = JSON.parse(agregados);
      this.aldeanosAgregados = new Set(lista);
    }
  }

  /**
   * Verificar si un aldeano ya fue agregado
   */
  esAldeanoAgregado(aldeanoId: string): boolean {
    return this.aldeanosAgregados.has(aldeanoId);
  }

  /**
   * Redirigir al login si no está autenticado
   */
  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Añadir aldeano como favorito y enviarlo al backend
   */
  ponerAFavoritos(v: any): void {
    const usuarioActual = this.authService.getCurrentUser();
    if (!usuarioActual) {
      this.redirectToLogin();
      return;
    }

    const aldeanoId = v.id.toString();
    const yaAgregado = this.esAldeanoAgregado(aldeanoId);

    if (yaAgregado) {
      // Remover de favoritos
      this.aldeanosAgregados.delete(aldeanoId);
      this.actualizarSessionStorage();
      return;
    }

    // Preparar datos para enviar al backend
    const aldeanoData = {
      id_api: v.id.toString(),
      url_api: 'https://api.nookipedia.com/villagers',
      nombre_aldeano: v.name,
      imagen_aldeano: v.image_url,
      personalidad: v.personality,
    };

    // Llamar al servicio para crear aldeano
    this.usuarioService.createAldeanoUsuario(usuarioActual.id, aldeanoData).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          // Agregar a sessionStorage
          this.aldeanosAgregados.add(aldeanoId);
          this.actualizarSessionStorage();
          console.log('Aldeano agregado exitosamente', v.name);
        } else {
          console.error('Error al agregar aldeano', response.message);
          alert('Error: ' + (response.message || 'No se pudo agregar el aldeano'));
        }
      },
      error: (err) => {
        console.error('Error en la solicitud', err);
        alert('Error al conectar con el servidor');
      },
    });
  }

  /**
   * Actualizar sessionStorage con la lista de aldeanos agregados
   */
  private actualizarSessionStorage(): void {
    const lista = Array.from(this.aldeanosAgregados);
    sessionStorage.setItem('aldeanos_agregados', JSON.stringify(lista));
  }
}
