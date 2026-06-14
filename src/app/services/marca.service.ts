import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  protected token: any;
  // [CACHE] Clave única en localStorage para el listado completo de marcas
  // activas. Se carga una sola vez (filtrarMarca con search vacío devuelve
  // TODAS las marcas vigentes) y se actualiza al crear marcas para evitar
  // re-consultar el backend en cada apertura del select de Nuevo Producto.
  private readonly CACHE_KEY = 'cache_marcas';
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
  }

  /**
   * Devuelve TODAS las marcas activas. Si ya hay cache en localStorage la
   * retorna sin pegarle al backend; con `forzar=true` ignora el cache y
   * recarga. Reutiliza el endpoint NuevoProducto&action=filtrarMarca con
   * search vacío (devuelve todas las marcas vigentes) — no requiere cambios
   * en el backend.
   */
  TodasMarcas(forzar: boolean = false): Observable<any[]> {
    const cache = this.leerCache();
    if (!forzar && cache && cache.length) {
      return of(cache);
    }
    const headers = new HttpHeaders({
      Authorization: this.servicio_login.getToken()
    });
    return this.httpcliente
      .get<any[]>(environment.api_url + "&controller=NuevoProducto&action=filtrarMarca&search=", { headers })
      .pipe(tap((marcas) => this.guardarCache(marcas || [])));
  }

  /** Inserta (o reemplaza) una marca en el cache para reflejarla sin recargar. */
  agregarMarcaCache(marca: any): void {
    if (!marca || marca.id_marca == null) { return; }
    const lista = this.leerCache() || [];
    const idx = lista.findIndex((m: any) => m.id_marca == marca.id_marca);
    if (idx >= 0) { lista[idx] = marca; } else { lista.unshift(marca); }
    this.guardarCache(lista);
  }

  /** Invalida el cache (usar tras editar/deshabilitar desde el módulo Marcas). */
  invalidarCacheMarcas(): void {
    try { localStorage.removeItem(this.CACHE_KEY); } catch (e) { }
  }

  private leerCache(): any[] | null {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  private guardarCache(marcas: any[]): void {
    try { localStorage.setItem(this.CACHE_KEY, JSON.stringify(marcas || [])); } catch (e) { }
  }
  GestionarMarca(formulario: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', formulario.id_marca);
    formData.append('glosa_marca', formulario.glosa_marca);
    formData.append('accion', formulario.accion);
    if (formulario.modulo) {
      formData.append('modulo', formulario.modulo);
    }
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Marca&action=gestionarMarca", formData, { headers: headers })
  }
  TraerMarca(token: any, id_marca: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', id_marca);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Marca&action=traerMarca", formData, { headers: headers })
  }
  Habilitar_Deshabilitar_Marca(token: any, id_marca: any, accion: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', id_marca);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Marca&action=actualizarestadoMarca", formData, { headers: headers })
  }
}
