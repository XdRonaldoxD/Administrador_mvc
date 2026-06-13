import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

/**
 * [PERMISOS] Maneja qué módulos puede ver el usuario actual según su perfil.
 * - El backend (controller=Permiso) deriva el id_perfil del JWT (no manipulable).
 * - El ADMINISTRADOR (id_perfil=1) ve todos los módulos.
 * - Las "claves" son los valores `link_modulo` del catálogo (SUCURSAL, VENTAS, ...).
 */
@Injectable({ providedIn: 'root' })
export class PermisoService {
  private claves: string[] | null = null;
  private esAdmin = false;

  constructor(private http: HttpClient, private login: LoginService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: this.login.getToken() });
  }

  /** Carga desde el backend los módulos permitidos del usuario actual y los cachea. */
  cargarMisModulos(): Observable<any> {
    return this.http
      .get<any>(environment.api_url + '&controller=Permiso&action=misModulos', { headers: this.headers() })
      .pipe(
        tap((r) => {
          this.esAdmin = !!r.es_admin;
          this.claves = Array.isArray(r.modulos) ? r.modulos : [];
          localStorage.setItem('permisos_modulos', JSON.stringify(this.claves));
          localStorage.setItem('permisos_admin', this.esAdmin ? '1' : '0');
        })
      );
  }

  private cargarCache(): void {
    if (this.claves === null) {
      try {
        this.claves = JSON.parse(localStorage.getItem('permisos_modulos') || '[]');
      } catch {
        this.claves = [];
      }
      this.esAdmin = localStorage.getItem('permisos_admin') === '1';
    }
  }

  /** ¿El usuario puede ver el módulo con esa clave? El admin siempre puede. */
  puedeVer(clave: string): boolean {
    this.cargarCache();
    return this.esAdmin || (this.claves || []).includes(clave);
  }

  /** ¿Puede ver al menos uno de estos módulos? (para ocultar grupos vacíos). */
  puedeVerAlguno(claves: string[]): boolean {
    return claves.some((c) => this.puedeVer(c));
  }

  esAdministrador(): boolean {
    this.cargarCache();
    return this.esAdmin;
  }

  limpiarCache(): void {
    this.claves = null;
    this.esAdmin = false;
    localStorage.removeItem('permisos_modulos');
    localStorage.removeItem('permisos_admin');
  }

  // ---- Gestión (solo admin) ----
  listar(): Observable<any> {
    return this.http.get<any>(environment.api_url + '&controller=Permiso&action=listar', { headers: this.headers() });
  }
  modulosPorPerfil(id_perfil: number): Observable<any> {
    return this.http.get<any>(
      environment.api_url + '&controller=Permiso&action=modulosPorPerfil&id_perfil=' + id_perfil,
      { headers: this.headers() }
    );
  }
  guardar(id_perfil: number, modulos: number[]): Observable<any> {
    return this.http.post<any>(
      environment.api_url + '&controller=Permiso&action=guardar',
      { id_perfil, modulos },
      { headers: this.headers() }
    );
  }
}
