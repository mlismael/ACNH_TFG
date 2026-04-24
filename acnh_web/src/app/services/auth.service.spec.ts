import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginCredentials, RegisterData } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Login', () => {
    it('should login user successfully', () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      service.login(credentials).subscribe((response) => {
        expect(response.status).toBe('success');
        expect(service.isLoggedIn()).toBe(true);
        expect(service.getCurrentUser()).toEqual(mockUser);
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php'),
      );
      expect(req.request.method).toBe('POST');
      req.flush({
        status: 'success',
        message: 'Login exitoso',
        data: { user: mockUser },
      });
    });

    it('should handle login error', () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      service.login(credentials).subscribe(
        () => {
          fail('should have failed');
        },
        (error) => {
          expect(error).toBeTruthy();
        },
      );

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php'),
      );
      req.flush(
        { status: 'error', message: 'Credenciales inválidas' },
        { status: 401, statusText: 'Unauthorized' },
      );
    });
  });

  describe('Register', () => {
    it('should register user successfully', () => {
      const registerData: RegisterData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      service.register(registerData).subscribe((response) => {
        expect(response.status).toBe('success');
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php'),
      );
      expect(req.request.method).toBe('POST');
      req.flush({ status: 'success', message: 'Usuario creado' });
    });

    it('should handle registration error', () => {
      const registerData: RegisterData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      service.register(registerData).subscribe(
        () => {
          fail('should have failed');
        },
        (error) => {
          expect(error).toBeTruthy();
        },
      );

      const req = httpMock.expectOne((request) =>
        request.url.includes('index.php'),
      );
      req.flush(
        { status: 'error', message: 'El usuario ya existe' },
        { status: 400, statusText: 'Bad Request' },
      );
    });
  });

  describe('Logout', () => {
    it('should logout user', () => {
      service.logout();
      expect(service.isLoggedIn()).toBe(false);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('Token Management', () => {
    it('should save and retrieve token', () => {
      const token = 'test_token_12345';
      sessionStorage.setItem('auth_token', token);
      expect(service.getToken()).toBe(token);
    });

    it('should remove token on logout', () => {
      sessionStorage.setItem('auth_token', 'test_token');
      service.logout();
      expect(service.getToken()).toBeNull();
    });
  });
});
