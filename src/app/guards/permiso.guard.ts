import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { PermisoService } from '../services/permiso.service';

/**
 * [PERMISOS] Bloquea el acceso a una ruta si el perfil del usuario no tiene el módulo.
 * - Rutas con `data: { modulo: 'CLAVE' }` se validan contra los módulos permitidos.
 * - Rutas con `data: { soloAdmin: true }` solo las abre el ADMINISTRADOR.
 * - El ADMINISTRADOR pasa siempre (puedeVer/esAdministrador lo contemplan).
 */
@Injectable({ providedIn: 'root' })
export class PermisoGuard implements CanActivate {
  constructor(private permiso: PermisoService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const data = route.data || {};
    if (data['soloAdmin']) {
      return this.permiso.esAdministrador() ? true : this.router.createUrlTree(['/inicio']);
    }
    const modulo = data['modulo'];
    if (!modulo) {
      return true;
    }
    return this.permiso.puedeVer(modulo) ? true : this.router.createUrlTree(['/inicio']);
  }
}
