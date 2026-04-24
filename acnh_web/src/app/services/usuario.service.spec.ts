import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService],
    });
    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Métodos de Usuario', () => {
    it('should update user data', () => {
      const userId = 1;
      const updateData = {
        username: 'newusername',
        email: 'newemail@example.com',
        nombre_isla: 'Nueva Isla',
      };

      service.updateUsuario(userId, updateData).subscribe((response) => {
        expect(response.status).toBe('success');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('controlador') === 'Usuario' &&
        request.params.get('accion') === 'actualizar',
      );
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'success', message: 'Usuario actualizado' });
    });

    it('should get user data', () => {
      const userId = 1;
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        nombre_isla: 'Mi Isla',
      };

      service.getUsuario(userId).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('accion') === 'ver',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: mockUser });
    });
  });

  describe('Métodos de Aldeanos', () => {
    it('should get aldeanos by user id', () => {
      const userId = 1;
      const mockAldeanos = [
        {
          id: 1,
          id_usuario: userId,
          nombre_aldeano: 'Bob',
          personalidad: 'Lazy',
        },
        {
          id: 2,
          id_usuario: userId,
          nombre_aldeano: 'Isabelle',
          personalidad: 'Peppy',
        },
      ];

      service.getAldeanosUsuario(userId).subscribe((aldeanos) => {
        expect(aldeanos.length).toBe(2);
        expect(aldeanos[0].nombre_aldeano).toBe('Bob');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('controlador') === 'AldeanosUsuario',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: mockAldeanos });
    });

    it('should get aldeano by id', () => {
      const aldeanoId = 1;
      const mockAldeano = {
        id: 1,
        id_usuario: 1,
        nombre_aldeano: 'Bob',
        personalidad: 'Lazy',
      };

      service.getAldeanoById(aldeanoId).subscribe((aldeano) => {
        expect(aldeano.nombre_aldeano).toBe('Bob');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('accion') === 'ver' &&
        request.params.get('controlador') === 'AldeanosUsuario',
      );
      req.flush({ status: 'success', data: mockAldeano });
    });

    it('should count aldeanos for user', () => {
      const userId = 1;

      service.contarAldeanosUsuario(userId).subscribe((count) => {
        expect(count).toBe(5);
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('accion') === 'contarPorUsuario',
      );
      req.flush({ status: 'success', data: { total: 5 } });
    });

    it('should delete aldeano usuario', () => {
      const aldeanoId = 1;

      service.deleteAldeanoUsuario(aldeanoId).subscribe((response) => {
        expect(response.status).toBe('success');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('accion') === 'eliminar' &&
        request.params.get('controlador') === 'AldeanosUsuario',
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', message: 'Aldeano eliminado' });
    });
  });

  describe('Métodos de Coleccionables', () => {
    it('should get coleccionables by user id', () => {
      const userId = 1;
      const mockColeccionables = [
        { id: 1, id_usuario: userId, id_tipo: 1, nombre: 'Bug1' },
        { id: 2, id_usuario: userId, id_tipo: 2, nombre: 'Fish1' },
      ];

      service.getColeccionablesUsuario(userId).subscribe((coleccionables) => {
        expect(coleccionables.length).toBe(2);
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('controlador') === 'ColeccionablesUsuario',
      );
      req.flush({ status: 'success', data: mockColeccionables });
    });

    it('should filter coleccionables by type', () => {
      const userId = 1;
      const tipoId = 1;
      const mockColeccionables = [
        { id: 1, id_usuario: userId, id_tipo: 1, nombre: 'Bug1' },
        { id: 2, id_usuario: userId, id_tipo: 1, nombre: 'Bug2' },
      ];

      service
        .getColeccionablesUsuarioPorTipo(userId, tipoId)
        .subscribe((coleccionables) => {
          expect(coleccionables.every((c) => c.id_tipo === tipoId)).toBe(true);
        });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php'),
      );
      req.flush({ status: 'success', data: mockColeccionables });
    });

    it('should get coleccionable by id', () => {
      const coleccionableId = 1;
      const mockColeccionable = {
        id: 1,
        id_usuario: 1,
        id_tipo: 1,
        nombre: 'Bug1',
      };

      service.getColeccionableById(coleccionableId).subscribe((col) => {
        expect(col.nombre).toBe('Bug1');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('controlador') === 'ColeccionablesUsuario' &&
        request.params.get('accion') === 'ver',
      );
      req.flush({ status: 'success', data: mockColeccionable });
    });

    it('should delete coleccionable usuario', () => {
      const coleccionableId = 1;

      service.deleteColeccionableUsuario(coleccionableId).subscribe((response) => {
        expect(response.status).toBe('success');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('accion') === 'eliminar' &&
        request.params.get('controlador') === 'ColeccionablesUsuario',
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({ status: 'success', message: 'Coleccionable eliminado' });
    });

    it('should get tipos coleccionables', () => {
      const mockTipos = [
        { id: 1, nombre: 'Insectos' },
        { id: 2, nombre: 'Peces' },
      ];

      service.getTiposColeccionables().subscribe((tipos) => {
        expect(tipos.length).toBe(2);
        expect(tipos[0].nombre).toBe('Insectos');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('controlador') === 'TipoColeccionable',
      );
      req.flush({ status: 'success', data: mockTipos });
    });
  });

  describe('Métodos de Estadísticas', () => {
    it('should get user statistics', (done) => {
      const userId = 1;

      service.getEstadisticasUsuario(userId).subscribe((stats) => {
        expect(stats.totalAldeanos).toBe(5);
        expect(stats.totalColeccionables).toBe(10);
        expect(stats.coleccionablesPorTipo.length).toBeGreaterThan(0);
        done();
      });

      // Mock multiple requests
      const requests = httpMock.match((request) =>
        request.url.includes('index.php'),
      );
      expect(requests.length).toBe(3); // aldeanos, coleccionables, tipos

      requests[0].flush({ status: 'success', data: { total: 5 } });
      requests[1].flush({
        status: 'success',
        data: [
          { id: 1, id_tipo: 1 },
          { id: 2, id_tipo: 1 },
          { id: 3, id_tipo: 2 },
        ],
      });
      requests[2].flush({
        status: 'success',
        data: [
          { id: 1, nombre: 'Insectos' },
          { id: 2, nombre: 'Peces' },
        ],
      });
    });
  });

  describe('Métodos de Crear Aldeanos', () => {
    it('should create aldeano for user', () => {
      const userId = 1;
      const aldeanoData = {
        id_api: 'villager_123',
        url_api: 'https://api.nookipedia.com/villagers/Bob',
        nombre_aldeano: 'Bob',
        imagen_aldeano: 'https://api.nookipedia.com/images/Bob.png',
        personalidad: 'Lazy',
      };

      service.createAldeanoUsuario(userId, aldeanoData).subscribe((response) => {
        expect(response.status).toBe('success');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('controlador') === 'AldeanosUsuario' &&
        request.params.get('accion') === 'crear',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body.id_usuario).toBe(userId);
      expect(req.request.body.nombre_aldeano).toBe('Bob');
      req.flush({ status: 'success', message: 'Aldeano creado' });
    });

    it('should create aldeano with minimal data', () => {
      const userId = 1;
      const aldeanoData = {
        id_api: 'villager_123',
        nombre_aldeano: 'Bob',
      };

      service.createAldeanoUsuario(userId, aldeanoData).subscribe((response) => {
        expect(response.status).toBe('success');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php'),
      );
      expect(req.request.body.id_usuario).toBe(userId);
      req.flush({ status: 'success', message: 'Aldeano creado' });
    });
  });

  describe('Métodos de Crear Coleccionables', () => {
    it('should create coleccionable for user', () => {
      const userId = 1;
      const coleccionableData = {
        id_tipo: 1,
        id_api: 'bug_123',
        nombre: 'Ant',
        imagen: 'https://api.nookipedia.com/images/bugs/Ant.png',
      };

      service
        .createColeccionableUsuario(userId, coleccionableData)
        .subscribe((response) => {
          expect(response.status).toBe('success');
        });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php') &&
        request.params.get('controlador') === 'ColeccionablesUsuario' &&
        request.params.get('accion') === 'crear',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body.id_usuario).toBe(userId);
      expect(req.request.body.nombre).toBe('Ant');
      expect(req.request.body.id_tipo).toBe(1);
      req.flush({ status: 'success', message: 'Coleccionable creado' });
    });

    it('should create coleccionable with minimal data', () => {
      const userId = 1;
      const coleccionableData = {
        id_tipo: 1,
        id_api: 'bug_123',
        nombre: 'Ant',
      };

      service
        .createColeccionableUsuario(userId, coleccionableData)
        .subscribe((response) => {
          expect(response.status).toBe('success');
        });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php'),
      );
      expect(req.request.body.id_usuario).toBe(userId);
      req.flush({ status: 'success', message: 'Coleccionable creado' });
    });
  });
});
