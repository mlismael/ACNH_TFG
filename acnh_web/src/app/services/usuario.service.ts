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
  nombre_isla?: string;
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
  private baseUrl = 'http://localhost/ACNH_TFG/acnh_project/index.php';

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

    return this.http.post<ApiResponse>(this.baseUrl, updateData, { params });
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
   * Obtiene un aldeano específico por su ID
   * @param aldeanoId ID del aldeano
   */
  public getAldeanoById(aldeanoId: number): Observable<AldeanoUsuario> {
    const params = new HttpParams()
      .set('controlador', 'AldeanosUsuario')
      .set('accion', 'ver')
      .set('id', aldeanoId.toString());

    return this.http.get<ApiResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && response.data) {
          return response.data as AldeanoUsuario;
        }
        throw new Error('Error al obtener aldeano');
      }),
    );
  }

  /**
   * Obtiene el contador de aldeanos de un usuario
   * @param userId ID del usuario
   */
  public contarAldeanosUsuario(userId: number): Observable<number> {
    const params = new HttpParams()
      .set('controlador', 'AldeanosUsuario')
      .set('accion', 'contarPorUsuario')
      .set('id_usuario', userId.toString());

    return this.http.get<ApiResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && response.data?.total !== undefined) {
          return response.data.total;
        }
        return 0;
      }),
    );
  }

  /**
   * Elimina un aldeano del usuario
   * @param aldeanoId ID del aldeano a eliminar
   */
  public deleteAldeanoUsuario(aldeanoId: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('controlador', 'AldeanosUsuario')
      .set('accion', 'eliminar')
      .set('id', aldeanoId.toString());

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
            coleccionables = coleccionables.filter(
              (c) => c.id_tipo === tipoId,
            );
          }

          return coleccionables;
        }
        return [];
      }),
    );
  }

  /**
   * Obtiene un coleccionable específico por su ID
   * @param coleccionableId ID del coleccionable
   */
  public getColeccionableById(
    coleccionableId: number,
  ): Observable<ColeccionableUsuario> {
    const params = new HttpParams()
      .set('controlador', 'ColeccionablesUsuario')
      .set('accion', 'ver')
      .set('id', coleccionableId.toString());

    return this.http.get<ApiResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && response.data) {
          return response.data as ColeccionableUsuario;
        }
        throw new Error('Error al obtener coleccionable');
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
   * Elimina un coleccionable del usuario
   * @param coleccionableId ID del coleccionable a eliminar
   */
  public deleteColeccionableUsuario(
    coleccionableId: number,
  ): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('controlador', 'ColeccionablesUsuario')
      .set('accion', 'eliminar')
      .set('id', coleccionableId.toString());

    return this.http.delete<ApiResponse>(this.baseUrl, { params });
  }

  /**
   * Obtiene todos los tipos de coleccionables
   */
  public getTiposColeccionables(): Observable<TipoColeccionable[]> {
    const params = new HttpParams()
      .set('controlador', 'TipoColeccionable')
      .set('accion', 'listar');

    return this.http.get<ApiResponse>(this.baseUrl, { params }).pipe(
      map((response) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          return response.data as TipoColeccionable[];
        }
        return [];
      }),
    );
  }

  // ===== MÉTODOS DE ESTADÍSTICAS =====

  /**
   * Obtiene estadísticas del usuario (conteo de aldeanos y coleccionables por tipo)
   * @param userId ID del usuario
   */
  public getEstadisticasUsuario(
    userId: number,
  ): Observable<{
    totalAldeanos: number;
    totalColeccionables: number;
    coleccionablesPorTipo: { tipo: string; cantidad: number }[];
  }> {
    return new Observable((observer) => {
      Promise.all([
        this.contarAldeanosUsuario(userId).toPromise(),
        this.getColeccionablesUsuario(userId).toPromise(),
        this.getTiposColeccionables().toPromise(),
      ])
        .then(([totalAldeanos, coleccionables, tipos]) => {
          const totalColeccionables = coleccionables?.length || 0;

          // Contar por tipo
          const coleccionablesPorTipo = (tipos || []).map((tipo) => ({
            tipo: tipo.nombre,
            cantidad: (coleccionables || []).filter(
              (c) => c.id_tipo === tipo.id,
            ).length,
          }));

          observer.next({
            totalAldeanos: totalAldeanos || 0,
            totalColeccionables,
            coleccionablesPorTipo,
          });
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
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
