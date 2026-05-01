import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = signal<boolean>(true);
  successMessage = signal<string | null>(null);

  // Modelos para los formularios
  loginData = {
    username: '',
    password: '',
  };

  registerData = {
    username: '',
    email: '',
    password: '',
  };

  toggleMode() {
    this.isLoginMode.update((val) => !val);
  }

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => console.error('Error en login', err),
    });
  }

  onRegister() {
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.mostrarAlerta('Usuario creado con éxito');
          this.isLoginMode.set(true);
        }
      },
      error: (err) => console.error('Error en registro', err),
    });
  }

  private mostrarAlerta(msg: string) {
    this.successMessage.set(msg);
    // Auto-cierre a los 4 segundos
    setTimeout(() => {
      this.successMessage.set(null);
    }, 4000);
  }

  ngOnInit() {
    // Configuración de tema para Peces
    const fishTheme: PageThemeConfig = {
      light: {
        color: '#BCAAA4',
        bgHorizontal: '/assets/fondo-nook-naranja.jpeg',
        bgVertical: '/assets/Gemini_Generated_Image_8dja1t8dja1t8dja.png',
      },
      dark: {
        color: '#8D6E63',
        bgHorizontal: '/assets/Gemini_Generated_Image_xq54pzxq54pzxq54.png',
        bgVertical: '/assets/Gemini_Generated_Image_p82a0p82a0p82a0p.png',
      },
    };

    this.themeService.setPageTheme(fishTheme);
  }

  ngOnDestroy() {
    this.themeService.resetPageTheme();
  }
}
