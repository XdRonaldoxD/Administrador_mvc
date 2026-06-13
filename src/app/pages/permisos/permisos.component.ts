import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PermisoService } from '../../services/permiso.service';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css'],
})
export class PermisosComponent implements OnInit {
  perfiles: any[] = [];
  grupos: { nombre: string; modulos: any[] }[] = [];
  id_perfil: any = '';
  seleccionados: Set<number> = new Set<number>();
  cargando = false;
  guardando = false;

  constructor(private permiso: PermisoService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.permiso.listar().subscribe({
      next: (r) => {
        this.perfiles = r.perfiles || [];
        const map: { [k: string]: any[] } = {};
        (r.modulos || []).forEach((m: any) => {
          const g = m.clase_modulo || 'OTROS';
          (map[g] = map[g] || []).push(m);
        });
        this.grupos = Object.keys(map).map((k) => ({ nombre: k, modulos: map[k] }));
      },
      error: () =>
        this.toastr.error('No se pudo cargar el catálogo de módulos.', 'Error', {
          positionClass: 'toast-top-right',
        }),
    });
  }

  seleccionarPerfil(): void {
    this.seleccionados = new Set<number>();
    if (!this.id_perfil) {
      return;
    }
    this.cargando = true;
    this.permiso.modulosPorPerfil(Number(this.id_perfil)).subscribe({
      next: (ids: number[]) => {
        this.seleccionados = new Set<number>((ids || []).map((x) => Number(x)));
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.toastr.error('No se pudieron cargar los permisos del perfil.', 'Error', {
          positionClass: 'toast-top-right',
        });
      },
    });
  }

  estaMarcado(id: number): boolean {
    return this.seleccionados.has(Number(id));
  }

  toggle(id: number, ev: any): void {
    if (ev.target.checked) {
      this.seleccionados.add(Number(id));
    } else {
      this.seleccionados.delete(Number(id));
    }
  }

  grupoCompleto(grupo: any): boolean {
    return grupo.modulos.length > 0 && grupo.modulos.every((m: any) => this.seleccionados.has(Number(m.id_modulo)));
  }

  toggleGrupo(grupo: any, ev: any): void {
    const marcar = ev.target.checked;
    grupo.modulos.forEach((m: any) => {
      if (marcar) {
        this.seleccionados.add(Number(m.id_modulo));
      } else {
        this.seleccionados.delete(Number(m.id_modulo));
      }
    });
  }

  guardar(): void {
    if (!this.id_perfil) {
      this.toastr.info('Selecciona un perfil primero.', 'Permisos', { positionClass: 'toast-top-right' });
      return;
    }
    this.guardando = true;
    this.permiso.guardar(Number(this.id_perfil), Array.from(this.seleccionados)).subscribe({
      next: () => {
        this.guardando = false;
        this.toastr.success('Permisos del perfil actualizados.', 'Listo', { positionClass: 'toast-top-right' });
      },
      error: () => {
        this.guardando = false;
        this.toastr.error('No se pudieron guardar los permisos.', 'Error', { positionClass: 'toast-top-right' });
      },
    });
  }
}
