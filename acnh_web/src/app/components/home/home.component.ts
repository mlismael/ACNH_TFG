import { Component, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemeService, PageThemeConfig } from '../../services/theme.service';
import { NookipediaService } from '../../services/nookipedia.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs'; // Para cargar dos meses a la vez si es necesario

export interface CalendarDay {
  day: number | null;
  fullDate: string;
  events: any[];
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private nookipediaService = inject(NookipediaService);

  currentDate = signal(new Date()); // Fecha de referencia
  vistaMensual = signal<boolean>(true);

  // Almacén de eventos para evitar recargas constantes y facilitar el cruce de meses
  eventosCargados = signal<any[]>([]);

  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Lógica del Bocadillo (Tooltips)
  bocadilloVisible = signal(false);
  bocadilloX = signal(0);
  bocadilloY = signal(0);
  bocadilloEvento = signal<any>(null);

  /**
   * TÍTULO DINÁMICO: 
   * Si es semana y cruza meses, muestra "Abril - Mayo 2026"
   */
  nombreMes = computed(() => {
    const days = this.calendarDaysVisible();
    if (this.vistaMensual() || days.length === 0) {
      return this.currentDate().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    }

    const primerDia = new Date(days[0].fullDate);
    const ultimoDia = new Date(days[days.length - 1].fullDate);

    if (primerDia.getMonth() !== ultimoDia.getMonth()) {
      const mes1 = primerDia.toLocaleString('es-ES', { month: 'long' });
      const mes2 = ultimoDia.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      return `${mes1} - ${mes2}`;
    }

    return this.currentDate().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  });

  ngOnInit() {
    const homeTheme: PageThemeConfig = {
      light: {
        color: 'rgb(166, 234, 151)',
        bgHorizontal: '/assets/ACNH_Island_[2560x1440]-horizontal.jpeg',
        bgVertical: '/assets/ACNH_Island_[1080x1920]-vertical.jpeg',
      },
      dark: {
        color: 'rgba(70, 118, 84, 0.52)',
        bgHorizontal: '/assets/fondo_inicio_oscuro_h.png',
        bgVertical: '/assets/fondo_inicio_oscuro_v.png',
      },
    };
    this.themeService.setPageTheme(homeTheme);
    this.cargarDatos();

    if (window.innerWidth <= 600) {
      this.vistaMensual.set(true);
    }
  }

  /**
   * CARGA DE DATOS:
   * Detecta si la vista actual necesita eventos de uno o dos meses.
   */
  cargarDatos(): void {
    const visibleDays = this.calendarDaysVisible();
    if (visibleDays.length === 0) return;

    const mesesANecesitar = new Set<string>();
    visibleDays.forEach(d => {
      if (d.fullDate) {
        const [y, m] = d.fullDate.split('-');
        mesesANecesitar.add(`${y}-${m}`);
      }
    });

    const peticiones = Array.from(mesesANecesitar).map(mesYear => {
      const [y, m] = mesYear.split('-');
      return this.nookipediaService.getEvents(undefined, y, m);
    });

    forkJoin(peticiones).subscribe({
      next: (resultados) => {
        // Unimos todos los eventos en un solo array plano
        this.eventosCargados.set(resultados.flat());
      },
      error: (err) => console.error('Error al cargar eventos:', err),
    });
  }

  /**
   * CÁLCULO DE DÍAS VISIBLES:
   * Esta es la "fuente de verdad" para el HTML.
   */
  calendarDaysVisible = computed(() => {
    const ref = this.currentDate();
    const eventos = this.eventosCargados();

    if (this.vistaMensual()) {
      return this.generarMesCompleto(ref, eventos);
    } else {
      return this.generarSemanaISO(ref, eventos);
    }
  });

  private generarMesCompleto(fecha: Date, eventos: any[]): CalendarDay[] {
    const year = fecha.getFullYear();
    const month = fecha.getMonth();
    const primerDiaSemana = new Date(year, month, 1).getDay();
    const inicio = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    const diasEnMes = new Date(year, month + 1, 0).getDate();

    const resultado: CalendarDay[] = [];
    for (let i = 0; i < inicio; i++) resultado.push({ day: null, fullDate: '', events: [] });

    for (let i = 1; i <= diasEnMes; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      resultado.push({
        day: i,
        fullDate: dateStr,
        events: eventos.filter(e => e.date === dateStr)
      });
    }
    return resultado;
  }

  private generarSemanaISO(fecha: Date, eventos: any[]): CalendarDay[] {
    const ref = new Date(fecha);
    const dayOfWeek = ref.getDay(); // 0 (Dom) a 6 (Sab)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const lunes = new Date(ref);
    lunes.setDate(ref.getDate() + diffToMonday);

    const semana: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      semana.push({
        day: d.getDate(),
        fullDate: dateStr,
        events: eventos.filter(e => e.date === dateStr)
      });
    }
    return semana;
  }

  cambiarPeriodo(incremento: number): void {
    const nueva = new Date(this.currentDate());
    if (this.vistaMensual()) {
      nueva.setMonth(nueva.getMonth() + incremento);
      nueva.setDate(1);
    } else {
      nueva.setDate(nueva.getDate() + (incremento * 7));
    }
    this.currentDate.set(nueva);
    this.cargarDatos(); // Recargar eventos para el nuevo periodo
  }

  toggleVista() {
    this.vistaMensual.update(v => !v);
    this.cargarDatos();
  }

  // Métodos del bocadillo (se mantienen igual)
  mostrarBocadillo(event: MouseEvent, evento: any): void {
    const ANCHO_BOCADILLO = 160;
    const OFFSET_Y = 15;
    let x = event.clientX;
    let y = event.clientY - 80;
    const mitad = ANCHO_BOCADILLO / 2;
    if (x - mitad < 10) x = mitad + 10;
    if (x + mitad > window.innerWidth - 10) x = window.innerWidth - mitad - 10;
    if (y < 10) y = event.clientY + OFFSET_Y + 20;
    this.bocadilloX.set(x);
    this.bocadilloY.set(y);
    this.bocadilloEvento.set(evento);
    this.bocadilloVisible.set(true);
  }

  ocultarBocadillo(): void { this.bocadilloVisible.set(false); }

  ngOnDestroy() { this.themeService.resetPageTheme(); }
}