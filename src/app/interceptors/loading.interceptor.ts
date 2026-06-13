import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * [UI] Muestra el overlay de carga global SOLO en cargas "de pantalla":
 *  - Entrada a un módulo (resolver/carga inicial de la tabla).
 *  - Cambio de pestaña Activos → Deshabilitado (primera carga de esa tabla).
 *
 * Se EXCLUYE (no debe mostrar overlay):
 *  - Peticiones de fondo (chat / Pusher).
 *  - Autocompletar / búsquedas en vivo (acciones con busca/buscar/filtrar).
 *  - Búsqueda dentro de la tabla (DataTables con término) y paginación (start > 0),
 *    porque esas re-disparan el mismo endpoint de la tabla mientras el usuario escribe.
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  // Peticiones de fondo que nunca deben mostrar overlay.
  private readonly excluirUrl = ['Pusher', 'Chatbox', 'ChatLinea', 'TraerChatLineaActivo'];

  constructor(private loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.debeOmitir(req)) {
      return next.handle(req);
    }
    this.loading.show();
    return next.handle(req).pipe(finalize(() => this.loading.hide()));
  }

  private debeOmitir(req: HttpRequest<any>): boolean {
    const url = req.url || '';

    // 1) Peticiones de fondo (chat/pusher).
    if (this.excluirUrl.some((p) => url.includes(p))) {
      return true;
    }

    // 2) Autocompletar / búsquedas en vivo (FiltrarCliente, buscaUsuarioDefecto,
    //    BuscarRuc, filtrarMarca, BuscarDepartamento, etc.).
    if (/busca|filtrar|search/i.test(url)) {
      return true;
    }

    // 3) DataTables: omitir si es búsqueda dentro de la tabla o paginación
    //    (no es la carga inicial ni el cambio de pestaña).
    const body: any = req.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      const termino = body.search && body.search.value ? String(body.search.value).trim() : '';
      const filtro = body.filtro_buscar ? String(body.filtro_buscar).trim() : '';
      const start = Number(body.start) || 0;
      if (termino !== '' || filtro !== '' || start > 0) {
        return true;
      }
    }

    return false;
  }
}
