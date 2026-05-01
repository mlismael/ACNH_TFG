import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() isLogin: boolean = false;
  private authService = inject(AuthService);
  private router = inject(Router);
  // Inyectamos el servicio
  themeService = inject(ThemeService);

  user$ = this.authService.currentUser$;

  // Exponemos el signal para que el HTML sea más limpio
  // Al ser un signal, en el HTML lo usaremos como isDark()
  isDark = this.themeService.darkMode;

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
