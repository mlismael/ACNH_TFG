import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * Interfaz para el usuario autenticado
 */
export interface User {
  id: number;
  username: string;
  email: string;
  nombre_isla?: string;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  activo?: boolean;
}

/**
 * Interfaz para la respuesta de autenticación
 */
export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    user?: User;
    token?: string;
    [key: string]: any;
  };
}

/**
 * Interfaz para credenciales de login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Interfaz para datos de registro
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost/ACNH_TFG/acnh_project/index.php';
  private currentUser = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUser.asObservable();

  private isAuthenticated = new BehaviorSubject<boolean>(this.hasValidSession());
  public isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación
   */
  private initializeAuthState(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUser.next(user);
      this.isAuthenticated.next(true);
    }
  }

  /**
   * Realiza el login de un usuario
   * @param credentials Credenciales (username y password)
   * @returns Observable con la respuesta del servidor
   */
  public login(credentials: LoginCredentials): Observable<AuthResponse> {
    const params = new HttpParams()
      .set('controlador', 'Usuario')
      .set('accion', 'login');

    return this.http
      .post<AuthResponse>(this.baseUrl, credentials, { params })
      .pipe(
        tap((response) => {
          if (response.status === 'success' && response.data?.user) {
            this.setCurrentUser(response.data.user);
            this.isAuthenticated.next(true);
            this.saveUserToStorage(response.data.user);
            if (response.data?.token) {
              this.saveTokenToStorage(response.data.token);
            }
          }
        }),
      );
  }

  /**
   * Registra un nuevo usuario
   * @param registerData Datos del registro (username, email, password)
   * @returns Observable con la respuesta del servidor
   */
  public register(registerData: RegisterData): Observable<AuthResponse> {
    const { username, email, password } = registerData;

    const params = new HttpParams()
      .set('controlador', 'Usuario')
      .set('accion', 'crear');

    return this.http
      .post<AuthResponse>(
        this.baseUrl,
        { username, email, password },
        { params },
      )
      .pipe(
        tap((response) => {
          if (response.status === 'success') {
            // Si el registro es exitoso, podría automáticamente hacer login
            // O simplemente devolver el mensaje de éxito
          }
        }),
      );
  }

  /**
   * Realiza el logout del usuario
   */
  public logout(): void {
    this.currentUser.next(null);
    this.isAuthenticated.next(false);
    this.removeUserFromStorage();
    this.removeTokenFromStorage();
  }

  /**
   * Obtiene el usuario autenticado actual
   */
  public getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  public isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  /**
   * Obtiene el token almacenado
   */
  public getToken(): string | null {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }

  /**
   * Obtiene los datos del usuario por ID
   * @param userId ID del usuario
   */
  public getUserById(userId: number): Observable<User> {
    const params = new HttpParams()
      .set('controlador', 'Usuario')
      .set('accion', 'ver')
      .set('id', userId.toString());

    return this.http.get<AuthResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && response.data) {
          return response.data as User;
        }
        throw new Error('Error al obtener usuario');
      }),
    );
  }

  /**
   * Obtiene todos los usuarios (solo administradores)
   */
  public getAllUsers(): Observable<User[]> {
    const params = new HttpParams()
      .set('controlador', 'Usuario')
      .set('accion', 'listar');

    return this.http.get<AuthResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && response.data) {
          return Array.isArray(response.data) ? response.data : response.data as User[];
        }
        return [];
      }),
    );
  }

  // ===== MÉTODOS PRIVADOS DE ALMACENAMIENTO =====

  /**
   * Guarda el usuario en sessionStorage
   */
  private saveUserToStorage(user: User): void {
    sessionStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Obtiene el usuario desde sessionStorage
   */
  private getUserFromStorage(): User | null {
    const userStr = sessionStorage.getItem('current_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Elimina el usuario de sessionStorage
   */
  private removeUserFromStorage(): void {
    sessionStorage.removeItem('current_user');
  }

  /**
   * Guarda el token en sessionStorage
   */
  private saveTokenToStorage(token: string): void {
    sessionStorage.setItem('auth_token', token);
  }

  /**
   * Elimina el token de sessionStorage
   */
  private removeTokenFromStorage(): void {
    sessionStorage.removeItem('auth_token');
  }

  /**
   * Verifica si hay una sesión válida
   */
  private hasValidSession(): boolean {
    return !!this.getUserFromStorage();
  }

  /**
   * Actualiza el usuario actual
   */
  private setCurrentUser(user: User): void {
    this.currentUser.next(user);
  }
}
