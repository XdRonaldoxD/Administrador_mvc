import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { KardexService } from 'src/app/services/kardex.service';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.css'],
})
export class KardexComponent implements OnInit {
  filtro!: FormGroup;
  productos: any[] = [];
  bodegas: any[] = [];
  kardex: any = null;
  cargando = false;
  private token: any;

  constructor(
    private fb: FormBuilder,
    private servicio: KardexService,
    private login: LoginService
  ) {
    this.token = this.login.getToken();
    // Rango por defecto: del inicio del mes actual a hoy.
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.filtro = this.fb.group({
      id_producto: [null],
      id_bodega: [0],
      fecha_desde: [fmt(inicioMes)],
      fecha_hasta: [fmt(hoy)],
    });
  }

  ngOnInit(): void {
    this.servicio.filtros().subscribe({
      next: (r) => {
        this.productos = r.productos || [];
        this.bodegas = r.bodegas || [];
      },
      error: () => {},
    });
  }

  generar(): void {
    if (!this.filtro.value.id_producto) {
      this.aviso('warning', 'Selecciona un producto');
      return;
    }
    // [QA-FIX] Evitar rango de fechas invertido.
    const fd = this.filtro.value.fecha_desde;
    const fh = this.filtro.value.fecha_hasta;
    if (fd && fh && fd > fh) {
      this.aviso('warning', 'La fecha "desde" no puede ser mayor que "hasta"');
      return;
    }
    this.cargando = true;
    this.kardex = null;
    this.servicio
      .generar({
        id_producto: this.filtro.value.id_producto,
        id_bodega: this.filtro.value.id_bodega || 0,
        fecha_desde: this.filtro.value.fecha_desde || '',
        fecha_hasta: this.filtro.value.fecha_hasta || '',
      })
      .subscribe({
        next: (r) => {
          this.kardex = r;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          this.aviso('error', 'No se pudo generar el kardex');
        },
      });
  }

  exportar(): void {
    if (!this.filtro.value.id_producto) {
      this.aviso('warning', 'Selecciona un producto');
      return;
    }
    const headers = new Headers();
    headers.append('Authorization', this.token);
    const body = new FormData();
    body.append('id_producto', this.filtro.value.id_producto);
    body.append('id_bodega', this.filtro.value.id_bodega || 0);
    body.append('fecha_desde', this.filtro.value.fecha_desde || '');
    body.append('fecha_hasta', this.filtro.value.fecha_hasta || '');
    Swal.fire({
      title: 'Kardex',
      html: 'Exportando el excel ...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        fetch(environment.api_url + '&controller=Kardex&action=exportarKardex', {
          method: 'POST',
          headers,
          redirect: 'follow',
          body,
        })
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Kardex.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            Swal.close();
          })
          .catch((error) => {
            console.log('error', error);
            Swal.close();
          });
      },
    });
  }

  private aviso(icon: any, title: string): void {
    Swal.fire({
      toast: true,
      position: 'top',
      icon,
      title,
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 3000,
    });
  }
}
