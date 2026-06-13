import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _loginServicio: LoginService,
    private router: Router
  ) {}

  // [SEGURIDAD A6] Antes esta función retornaba `true` de forma síncrona mientras
  // la verificación de sesión corría en paralelo (el `return false` de dentro del
  // subscribe se ignoraba), por lo que el guard NUNCA bloqueaba realmente. Ahora
  // devuelve un Observable que resuelve la decisión según el backend.
  canActivate(): Observable<boolean | UrlTree> | boolean | UrlTree {
    const token = this._loginServicio.getToken();
    const identity = this._loginServicio.getIdentity();

    if (token == null || identity == null) {
      this.limpiarSesion();
      return this.router.createUrlTree(['/IniciarSession']);
    }

    // Defensa local de expiración (la validación real es server-side en cada request).
    if (this.expirado(identity.expiracion)) {
      this.limpiarSesion();
      return this.router.createUrlTree(['/IniciarSession']);
    }

    let payload: any;
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
    } catch {
      this.limpiarSesion();
      return this.router.createUrlTree(['/IniciarSession']);
    }

    // Verificación server-side de la sesión. respo == true => sesión inválida.
    return this._loginServicio.VerificacionUser(token, payload.sub, identity.session_id).pipe(
      map((respo: any): boolean | UrlTree => {
        if (respo == true) {
          this.limpiarSesion();
          return this.router.createUrlTree(['/IniciarSession']);
        }
        return true;
      }),
      catchError(() => {
        this.limpiarSesion();
        return of(this.router.createUrlTree(['/IniciarSession']));
      })
    );
  }

  private limpiarSesion(): void {
    localStorage.removeItem('UserIdentificado');
    localStorage.removeItem('token');
  }

  expirado(fechaExp: number): boolean {
    const ahora = new Date().getTime() / 1000;
    return fechaExp < ahora;
  }
}
