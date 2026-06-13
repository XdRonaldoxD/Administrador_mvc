import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * [SEGURIDAD A8/A9] Interceptor central de errores HTTP.
 *
 * Antes la app no tenía interceptor: ~40 `.subscribe()` no manejaban error, por lo
 * que los fallos de red/backend se tragaban en silencio (spinners colgados, estado
 * inconsistente). Además, al activar la autenticación real en el backend (C1), una
 * sesión inválida/expirada ahora responde 401: aquí se cierra la sesión y se
 * redirige al login de forma centralizada.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('UserIdentificado');
          localStorage.removeItem('token');
          this.router.navigate(['/IniciarSession']);
        }
        // No silenciar: dejar traza y re-lanzar para que el llamador pueda reaccionar.
        console.error('[HTTP error]', req.method, req.url, '->', error.status, error.message);
        return throwError(() => error);
      })
    );
  }
}
