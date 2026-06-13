import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

/** [KARDEX] Reporte de movimientos de inventario por producto (controller=Kardex). */
@Injectable({ providedIn: 'root' })
export class KardexService {
  constructor(private http: HttpClient, private login: LoginService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders().set('Authorization', this.login.getToken());
  }

  /** Catálogo de filtros: productos activos + bodegas. */
  filtros(): Observable<any> {
    return this.http.get<any>(environment.api_url + '&controller=Kardex&action=filtros', { headers: this.headers() });
  }

  /** Genera el kardex del producto/bodega/rango. */
  generar(filtro: any): Observable<any> {
    return this.http.post<any>(environment.api_url + '&controller=Kardex&action=generar', filtro, { headers: this.headers() });
  }
}
