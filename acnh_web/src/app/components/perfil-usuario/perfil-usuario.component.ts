import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, catchError, of, timeout } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import {
  UsuarioService,
  AldeanoUsuario,
  ColeccionableUsuario,
  UpdateUserData,
} from '../../services/usuario.service';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';

interface FormPerfil {
  username: string;
  email: string;
  nombre_isla: string;
  img_perfil: string;
  color_tema: string;
  passwordActual: string;
  passwordNueva: string;
  passwordConfirm: string;
}

const TIPO_BICHO = 1;
const TIPO_PEZ = 2;
const TIPO_MARINA = 3;
const API_TIMEOUT = 8000; // Tiempo máximo para esperar respuestas de la API (en ms)

@Component({
  selector: 'app-perfil-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrl: './perfil-usuario.component.css',
})
export class PerfilUsuarioComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Guardamos la suscripción para destruirla en ngOnDestroy
  private userSub!: Subscription;

  user = signal<User | null>(this.authService.getCurrentUser());
  editando = signal(false);
  aldeanos = signal<AldeanoUsuario[]>([]);
  bichos = signal<ColeccionableUsuario[]>([]);
  peces = signal<ColeccionableUsuario[]>([]);
  criaturasMarinas = signal<ColeccionableUsuario[]>([]);

  mostrarPassActual = signal(false);
  mostrarPassNueva = signal(false);
  mostrarPassConfirm = signal(false);

  formData = signal<FormPerfil>({
    username: '',
    email: '',
    nombre_isla: '',
    img_perfil: '',
    color_tema: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirm: '',
  });

  fotosDisponibles: string[] = [
    'https://dodo.ac/np/images/e/e3/Tom_Nook_NH.png',
    'https://dodo.ac/np/images/f/f5/Isabelle_NH_Transparent.png',
    'https://dodo.ac/np/images/f/fe/Blathers_NH_2.png',
    'https://dodo.ac/np/images/4/42/Redd_NH.png',
    'https://dodo.ac/np/images/4/49/C.J._NH.png',
    'https://dodo.ac/np/images/f/f4/Flick_NH.png',
    'https://dodo.ac/np/images/c/c9/Saharah_NH.png',
    'https://dodo.ac/np/images/6/69/Daisy_Mae_NH.png',
  ];

  coloresDisponibles: string[] = [
    '#FFC9C9',
    '#FFBE98',
    '#FCF6BD',
    '#FDF4E3',
    '#B2F2BB',
    '#9CBFA7',
    '#A5D8FF',
    '#E6D7FF',
  ];

  // ────────────────────────────────────────────────
  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user.set(user);
        this.cargarColecciones();
        this.actualizarTema(user.color_tema);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.themeService.resetPageTheme();
  }

  // ────────────────────────────────────────────────
  private actualizarTema(colorUsuario: string | undefined): void {
    const config: PageThemeConfig = {
      light: {
        color: colorUsuario || '#B2F2BB',
        bgHorizontal: '/assets/fondo-hojas-azules.jpeg',
        bgVertical: '/assets/fondo-hojas-azules-v.jpeg',
      },
      dark: {
        color: colorUsuario ? `${colorUsuario}78` : 'rgba(66, 195, 182, 0.47)',
        bgHorizontal: '/assets/fondo-hojas-verdes.jpeg',
        bgVertical: '/assets/fondo-hojas-verdes-v.jpeg',
      },
    };
    this.themeService.setPageTheme(config);
  }

  // ────────────────────────────────────────────────
  private cargarColecciones(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    // Cada petición tiene timeout y catchError para que nunca se quede colgada.
    // Si la API no responde en API_TIMEOUT ms → devuelve [] y continúa.
    this.usuarioService
      .getAldeanosUsuario(userId)
      .pipe(
        timeout(API_TIMEOUT),
        catchError((err) => {
          console.warn('Aldeanos no disponibles:', err);
          return of([]);
        }),
      )
      .subscribe((data) => this.aldeanos.set(data));

    this.usuarioService
      .getColeccionablesUsuarioPorTipo(userId, TIPO_BICHO)
      .pipe(
        timeout(API_TIMEOUT),
        catchError((err) => {
          console.warn('Bichos no disponibles:', err);
          return of([]);
        }),
      )
      .subscribe((data) => this.bichos.set(data));

    this.usuarioService
      .getColeccionablesUsuarioPorTipo(userId, TIPO_PEZ)
      .pipe(
        timeout(API_TIMEOUT),
        catchError((err) => {
          console.warn('Peces no disponibles:', err);
          return of([]);
        }),
      )
      .subscribe((data) => this.peces.set(data));

    this.usuarioService
      .getColeccionablesUsuarioPorTipo(userId, TIPO_MARINA)
      .pipe(
        timeout(API_TIMEOUT),
        catchError((err) => {
          console.warn('Criaturas marinas no disponibles:', err);
          return of([]);
        }),
      )
      .subscribe((data) => this.criaturasMarinas.set(data));
  }

  // ────────────────────────────────────────────────
  toggleEdicion(): void {
    const u = this.user();
    if (!this.editando() && u) {
      this.formData.set({
        username: u.username ?? '',
        email: u.email ?? '',
        nombre_isla: u.nombre_isla ?? '',
        img_perfil: u.img_perfil ?? '',
        color_tema: u.color_tema ?? '',
        passwordActual: '',
        passwordNueva: '',
        passwordConfirm: '',
      });
    }
    this.editando.update((v) => !v);
  }

  updateForm(campo: keyof FormPerfil, valor: string): void {
    this.formData.update((prev) => ({ ...prev, [campo]: valor }));
  }

  seleccionarFoto(foto: string): void {
    this.formData.update((prev) => ({ ...prev, img_perfil: foto }));
  }

  seleccionarColor(color: string): void {
    this.formData.update((prev) => ({ ...prev, color_tema: color }));
  }

  toggleOjo(campo: 'actual' | 'nueva' | 'confirm'): void {
    if (campo === 'actual') this.mostrarPassActual.update((v) => !v);
    if (campo === 'nueva') this.mostrarPassNueva.update((v) => !v);
    if (campo === 'confirm') this.mostrarPassConfirm.update((v) => !v);
  }

  // ────────────────────────────────────────────────
  guardarPerfil(): void {
    const form = this.formData();
    const userId = this.user()?.id;
    if (!userId) return;

    if (form.passwordNueva && form.passwordNueva !== form.passwordConfirm) {
      alert('Las contraseñas nuevas no coinciden.');
      return;
    }

    const payload: UpdateUserData = {
      username: form.username || undefined,
      email: form.email || undefined,
      nombre_isla: form.nombre_isla || undefined,
      img_perfil: form.img_perfil || undefined,
      color_tema: form.color_tema || undefined,
      ...(form.passwordNueva && { password: form.passwordNueva }),
    };

    this.usuarioService
      .updateUsuario(userId, payload)
      .pipe(
        timeout(API_TIMEOUT),
        catchError((err) => {
          console.error('Error al guardar perfil:', err);
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (!response) {
          alert('No se pudo guardar los cambios.');
          return;
        }

        this.usuarioService
          .getUsuario(userId)
          .pipe(
            timeout(API_TIMEOUT),
            catchError((err) => {
              console.error('Error al recargar usuario:', err);
              return of(null);
            }),
          )
          .subscribe((userActualizado: User | null) => {
            if (!userActualizado) return;
            sessionStorage.setItem(
              'current_user',
              JSON.stringify(userActualizado),
            );
            this.user.set(userActualizado);
            this.actualizarTema(userActualizado.color_tema);
            this.editando.set(false);
          });
      });
  }

  // ────────────────────────────────────────────────
  eliminarAldeano(aldeano: AldeanoUsuario): void {
    const usuarioActual = this.user();

    if (!usuarioActual) return;

    this.usuarioService
      .deleteAldeanoUsuario(usuarioActual.id, aldeano.id_api)
      .pipe(
        timeout(API_TIMEOUT),
        catchError((err) => {
          console.error('Error al eliminar aldeano:', err);
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response && response.status === 'success') {
          this.aldeanos.update((list) =>
            list.filter((a) => a.id_api !== aldeano.id_api),
          );
          console.log(`Aldeano ${aldeano.nombre_aldeano} eliminado.`);
        }
      });
  }

  eliminarColeccionable(coleccionable: ColeccionableUsuario): void {
    const usuarioActual = this.user();

    if (!usuarioActual) return;

    this.usuarioService
      .deleteColeccionableUsuario(usuarioActual.id, coleccionable.id_api)
      .pipe(
        timeout(API_TIMEOUT),
        catchError((err) => {
          console.error('Error al eliminar coleccionable:', err);
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response && response.status === 'success') {
          // Detectamos qué lista actualizar basándonos en el tipo_coleccionable
          // Usamos las constantes que definiste arriba (TIPO_BICHO, TIPO_PEZ, TIPO_MARINA)

          if (coleccionable.id_tipo === 1) {
            // TIPO_BICHO
            this.bichos.update((list) =>
              list.filter((c) => c.id_api !== coleccionable.id_api),
            );
          } else if (coleccionable.id_tipo === 2) {
            // TIPO_PEZ
            this.peces.update((list) =>
              list.filter((c) => c.id_api !== coleccionable.id_api),
            );
          } else if (coleccionable.id_tipo === 3) {
            // TIPO CRIATURA MARINA
            this.criaturasMarinas.update((list) =>
              list.filter((c) => c.id_api !== coleccionable.id_api),
            );
          }

        }
      });
  }
}
