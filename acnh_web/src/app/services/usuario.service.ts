import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interfaz para datos de usuario editable
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  img_perfil?: string;
  nombre_isla?: string;
  color_tema?: string;
  password?: string;
}

/**
 * Interfaz para aldeano del usuario
 */
export interface AldeanoUsuario {
  id: number;
  id_usuario: number;
  id_api: string;
  url_api?: string;
  nombre_aldeano: string;
  imagen_aldeano?: string;
  personalidad?: string;
}

/**
 * Interfaz para coleccionable del usuario
 */
export interface ColeccionableUsuario {
  id: number;
  id_usuario: number;
  id_tipo: number;
  id_api: string;
  nombre: string;
  imagen?: string;
  fecha_captura?: string;
}

/**
 * Interfaz para tipo de coleccionable
 */
export interface TipoColeccionable {
  id: number;
  nombre: string;
  descripcion?: string;
}

/**
 * Interfaz genérica para respuestas de API
 */
export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private baseUrl = 'https://acnhtfg-production.up.railway.app/index.php';

  constructor(private http: HttpClient) {}

  // ===== MÉTODOS DE USUARIO =====

  /**
   * Actualiza los datos del usuario
   * @param userId ID del usuario
   * @param updateData Datos a actualizar
   */
  public updateUsuario(
    userId: number,
    updateData: UpdateUserData,
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('controlador', 'Usuario')
      .set('accion', 'actualizar')
      .set('id', userId.toString());

    return this.http.patch<ApiResponse>(this.baseUrl, updateData, { params });
  }

  /**
   * Obtiene los datos del usuario
   * @param userId ID del usuario
   */
  public getUsuario(userId: number): Observable<any> {
    const params = new HttpParams()
      .set('controlador', 'Usuario')
      .set('accion', 'ver')
      .set('id', userId.toString());

    return this.http.get<ApiResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && response.data) {
          return response.data;
        }
        throw new Error('Error al obtener usuario');
      }),
    );
  }

  // ===== MÉTODOS DE ALDEANOS USUARIO =====

  /**
   * Obtiene todos los aldeanos de un usuario
   * @param userId ID del usuario
   */
  public getAldeanosUsuario(userId: number): Observable<AldeanoUsuario[]> {
    const params = new HttpParams()
      .set('controlador', 'AldeanosUsuario')
      .set('accion', 'listarPorUsuario')
      .set('id_usuario', userId.toString());

    return this.http.get<ApiResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          return response.data as AldeanoUsuario[];
        }
        return [];
      }),
    );
  }



  /**
   * Elimina un aldeano de los favoritos del usuario
   * @param userId ID del usuario logueado
   * @param idApi ID del aldeano en la API de Nookipedia (ej: 'ant00')
   */
  public deleteAldeanoUsuario(
    userId: number,
    idApi: string,
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('controlador', 'AldeanosUsuario')
      .set('accion', 'eliminar')
      .set('id_usuario', userId.toString())
      .set('id_api', idApi);

    return this.http.delete<ApiResponse>(this.baseUrl, { params });
  }

  // ===== MÉTODOS DE COLECCIONABLES USUARIO =====

  /**
   * Obtiene todos los coleccionables de un usuario, opcionalmente filtrados por tipo
   * @param userId ID del usuario
   * @param tipoId ID del tipo de coleccionable (opcional)
   */
  public getColeccionablesUsuario(
    userId: number,
    tipoId?: number,
  ): Observable<ColeccionableUsuario[]> {
    const params = new HttpParams()
      .set('controlador', 'ColeccionablesUsuario')
      .set('accion', 'listarPorUsuario')
      .set('id_usuario', userId.toString());

    return this.http.get<ApiResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          let coleccionables = response.data as ColeccionableUsuario[];

          // Filtrar por tipo si se proporciona
          if (tipoId !== undefined) {
            coleccionables = coleccionables.filter((c) => c.id_tipo === tipoId);
          }

          return coleccionables;
        }
        return [];
      }),
    );
  }



  /**
   * Obtiene coleccionables de un usuario filtrados por tipo de coleccionable
   * Este método obtiene todos y los filtra localmente por eficiencia
   * @param userId ID del usuario
   * @param tipoId ID del tipo de coleccionable
   */
  public getColeccionablesUsuarioPorTipo(
    userId: number,
    tipoId: number,
  ): Observable<ColeccionableUsuario[]> {
    return this.getColeccionablesUsuario(userId, tipoId);
  }

  /**
   * Elimina un coleccionable (pez, bicho, fósil...) de los favoritos del usuario
   * @param userId ID del usuario logueado
   * @param idApi ID único del ítem en la API (ej: 'bitterling', 'tricera-torso')
   */
  public deleteColeccionableUsuario(
    userId: number,
    idApi: string,
  ): Observable<ApiResponse> {
    // Configuramos los parámetros para que coincidan con lo que espera el controlador PHP
    const params = new HttpParams()
      .set('controlador', 'ColeccionablesUsuario')
      .set('accion', 'eliminar')
      .set('id_usuario', userId.toString())
      .set('id_api', idApi);

    return this.http.delete<ApiResponse>(this.baseUrl, { params });
  }


  // ===== MÉTODOS PARA CREAR ALDEANOS =====

  /**
   * Crea un nuevo aldeano para el usuario
   * @param userId ID del usuario
   * @param aldeanoData Datos del aldeano a crear
   */
  public createAldeanoUsuario(
    userId: number,
    aldeanoData: {
      id_api: string;
      url_api?: string;
      nombre_aldeano: string;
      imagen_aldeano?: string;
      personalidad?: string;
    },
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('controlador', 'AldeanosUsuario')
      .set('accion', 'crear');

    const payload = {
      id_usuario: userId,
      ...aldeanoData,
    };

    return this.http.post<ApiResponse>(this.baseUrl, payload, { params });
  }

  // ===== MÉTODOS PARA CREAR COLECCIONABLES =====

  /**
   * Crea un nuevo coleccionable para el usuario
   * @param userId ID del usuario
   * @param coleccionableData Datos del coleccionable a crear
   */
  public createColeccionableUsuario(
    userId: number,
    coleccionableData: {
      id_tipo: number;
      id_api: string;
      nombre: string;
      imagen?: string;
    },
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('controlador', 'ColeccionablesUsuario')
      .set('accion', 'crear');

    const payload = {
      id_usuario: userId,
      ...coleccionableData,
    };

    return this.http.post<ApiResponse>(this.baseUrl, payload, { params });
  }
}
