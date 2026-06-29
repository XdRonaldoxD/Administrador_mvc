import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { NotaVenta } from 'src/app/services/notaventa.service';
import { environment } from 'src/environments/environment';

// Pantalla mobile-first para vender silicona por onza.
// Reutiliza el MISMO endpoint de venta (Negocio/GenerarNegocio) que la Nota Venta:
// registra en caja, descuenta stock y genera comprobante igual que el POS normal.
@Component({
  selector: 'app-venta-silicona',
  templateUrl: './venta-silicona.component.html',
  styleUrls: ['./venta-silicona.component.css'],
})
export class VentaSiliconaComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  token: any;
  identificacion: any = false;

  productos: any[] = [];      // los productos de silicona (un sabor c/u)
  seleccionado: any = null;   // sabor elegido
  onzas: number = 1;

  // Tamaños = atajos de onzas (precio lineal: onzas x precio_onza).
  tamanos = [
    { label: 'Chico', oz: 2 },
    { label: 'Grande', oz: 8 }
  ];

  clienteId: any = null;      // cliente genérico
  efectivoId: any = 1;        // medio de pago efectivo
  id_caja: any = null;
  cobrando: boolean = false;
  mensajeOk: string = '';

  constructor(
    private http: HttpClient,
    private servicio_login: LoginService,
    private nota_venta: NotaVenta,
    private toast: ToastrService,
    public router: Router
  ) {
    this.token = this.servicio_login.getToken();
    this.identificacion = this.servicio_login.getIdentity();
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarMediosPago();
    this.asignarCliente();
    this.verificarCaja();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Trae los productos de silicona desde el mismo buscador del POS (filtra por "SILICONA").
  cargarProductos(): void {
    const headers = new HttpHeaders().set('Authorization', this.token);
    const body: any = {
      draw: 1,
      start: 0,
      length: 100,
      search: { value: '', regex: false },
      order: [],
      columns: [],
      filtro_buscar: 'SILICONA',
      id_bodega: this.identificacion.id_bodega
    };
    this.http.post<any>(environment.api_url + '&controller=NotaVenta&action=ListaProductos', body, { headers })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: resp => { this.productos = (resp && resp.data) ? resp.data : []; },
        error: () => { this.toast.error('No se pudieron cargar los productos'); }
      });
  }

  cargarMediosPago(): void {
    this.nota_venta.ListaMediosPagos().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (resp: any) => {
        const lista = resp || [];
        const efectivo = lista.find((m: any) => (m.glosa_medio_pago || '').toUpperCase().includes('EFECTIVO'));
        this.efectivoId = efectivo ? efectivo.id_medio_pago : (lista.length ? lista[0].id_medio_pago : 1);
      },
      error: () => { this.toast.error('No se pudieron cargar los medios de pago'); }
    });
  }

  asignarCliente(): void {
    this.nota_venta.AsignarCliente().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (item: any) => { this.clienteId = item ? item.id_cliente : null; },
      error: () => { this.toast.error('No existe el cliente genérico'); }
    });
  }

  verificarCaja(): void {
    this.nota_venta.VerificarCajaAbierta(this.identificacion.sub).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (resp: any) => { this.id_caja = (resp === false) ? null : resp; }
    });
  }

  // --- Interacción ---
  seleccionar(producto: any): void {
    this.seleccionado = producto;
    this.onzas = 1;
    this.mensajeOk = '';
  }

  elegirTamano(oz: number): void {
    if (!this.seleccionado) { return; }
    if (oz > Number(this.seleccionado.total_stock_producto_bodega)) {
      this.toast.warning('No hay suficiente stock para ese tamaño');
      return;
    }
    this.onzas = oz;
    this.mensajeOk = '';
  }

  mas(): void {
    if (!this.seleccionado) { return; }
    if (this.onzas + 1 > Number(this.seleccionado.total_stock_producto_bodega)) {
      this.toast.warning('No hay más stock de ese sabor');
      return;
    }
    this.onzas++;
  }

  menos(): void {
    if (this.onzas > 1) { this.onzas--; }
  }

  get total(): number {
    if (!this.seleccionado) { return 0; }
    return this.redondear2(Number(this.seleccionado.precioventa_stock_producto_bodega) * this.onzas);
  }

  // Etiqueta corta del sabor: "SILICONA FRESA - ONZA" -> "Fresa"
  sabor(glosa: string): string {
    const limpio = (glosa || '').replace(/SILICONA/i, '').replace(/-\s*ONZA/i, '').replace(/-/g, '').trim().toLowerCase();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }

  // Color por sabor (igual que el mockup aprobado)
  estiloSabor(glosa: string): any {
    const g = (glosa || '').toUpperCase();
    if (g.includes('FRESA')) { return { background: '#FBEAF0', border: '#ED93B1', color: '#72243E' }; }
    if (g.includes('MANZANA')) { return { background: '#EAF3DE', border: '#97C459', color: '#27500A' }; }
    if (g.includes('UVA')) { return { background: '#EEEDFE', border: '#AFA9EC', color: '#3C3489' }; }
    if (g.includes('CHICLE')) { return { background: '#E6F1FB', border: '#85B7EB', color: '#0C447C' }; }
    if (g.includes('CEREZA')) { return { background: '#FAECE7', border: '#F0997B', color: '#712B13' }; }
    return { background: '#F1EFE8', border: '#B4B2A9', color: '#444441' };
  }

  // --- Cobrar: arma el MISMO payload que la Nota Venta ---
  cobrar(): void {
    if (this.cobrando) { return; }
    if (!this.seleccionado) { this.toast.error('Elige un sabor'); return; }
    if (!this.id_caja) {
      this.toast.error('No tienes una caja abierta');
      return;
    }
    if (!this.clienteId) { this.toast.error('No hay cliente genérico'); return; }

    const total = this.total;
    const item = Object.assign({}, this.seleccionado, {
      cantidad_seleccionado: this.onzas,
      precio_venta_producto: this.redondear2(Number(this.seleccionado.precioventa_stock_producto_bodega) * this.onzas)
    });

    const datos: any = {
      informacionForm: {
        id_empresa: this.identificacion.id_empresa,
        cliente: this.clienteId,
        vendedor: this.identificacion.sub,
        tipo_documento: 'NOTA VENTA'
      },
      ProductoSeleccionados: [item],
      ListaMetodosPago: [{ id_medio_pago: this.efectivoId, monto: total, glosa_medio_pago: 'EFECTIVO' }],
      Totales: { subtotal: total.toFixed(2), igv: '0.00', total: total },
      Totales_pagados: { total_pagar: total, total_pagado: total, vuelto: 0 },
      id_caja: this.id_caja
    };

    this.cobrando = true;
    this.nota_venta.GenerarNegocio(datos).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: () => {
        this.cobrando = false;
        this.mensajeOk = `Vendido: ${this.onzas} oz de ${this.sabor(this.seleccionado.glosa_producto)} — S/${total.toFixed(2)}`;
        this.toast.success(this.mensajeOk);
        this.seleccionado = null;
        this.onzas = 1;
        this.cargarProductos(); // refresca el stock
      },
      error: () => {
        this.cobrando = false;
        this.toast.error('No se pudo registrar la venta. Verifica el stock.');
      }
    });
  }

  private redondear2(valor: any): number {
    const n = Number(valor);
    return isNaN(n) ? 0 : Number(n.toFixed(2));
  }
}
