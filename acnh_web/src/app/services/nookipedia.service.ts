import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslationService } from './translation.service';

@Injectable({
    providedIn: 'root',
})
export class NookipediaService {
    private baseUrl = 'https://acnhtfg-production.up.railway.app/index.php';

    constructor(private http: HttpClient, private translationService: TranslationService) { }

    // Obtener aldeanos
    getVillagers(
        search?: string,
        personality?: string,
        species?: string,
    ): Observable<any[]> {
        let params = new HttpParams()
            .set('controlador', 'Nookipedia')
            .set('accion', 'listarAldeanos');
        if (search) params = params.set('search', search);
        if (personality) params = params.set('personality', personality);
        if (species) params = params.set('species', species);

        return this.http
            .get<any>(this.baseUrl, { params })
            .pipe(
                map((response) => (response.status === 'success' ? response.data.map((v: any) => this.translationService.translateVillager(v)) : [])),
            );
    }

    // Obtener coleccionables (peces, bichos, criaturas marinas)
    getCollectibles(
        type: 'bugs' | 'fish' | 'sea',
        name?: string,
    ): Observable<any[]> {
        let params = new HttpParams()
            .set('controlador', 'Nookipedia')
            .set('accion', 'listarColeccionables')
            .set('type', type);
        if (name) params = params.set('name', name);

        return this.http
            .get<any>(this.baseUrl, { params })
            .pipe(
                map((response) => (response.status === 'success' ? response.data.map((v: any) => this.translationService.translateCollectible(v)) : [])),
            );
    }

    // Obtener eventos
    getEvents(
        date?: string,
        year?: string,
        month?: string,
        day?: string,
    ): Observable<any[]> {
        let params = new HttpParams()
            .set('controlador', 'Nookipedia')
            .set('accion', 'listarEventos');
        if (date) params = params.set('date', date);
        if (year) params = params.set('year', year);
        if (month) params = params.set('month', month);
        if (day) params = params.set('day', day);

        return this.http
            .get<any>(this.baseUrl, { params })
            .pipe(
                map((response) => (response.status === 'success' ? response.data.map((v: any) => this.translationService.translateEvent(v)) : [])),
            );
    }

}
