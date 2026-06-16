import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as ApexCharts from 'apexcharts';
import { environment } from 'src/environments/environment';
import { LoginService } from 'src/app/services/login.service';
import { PermisoService } from 'src/app/services/permiso.service';

interface AccesoRapido {
  clave: string;
  label: string;
  ruta: string;
  icon: string;
  color: string;
  soloAdmin?: boolean;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, AfterViewInit, OnDestroy {

  identificacion: any;
  fechaHoy = '';
  saludo = '';
  accesos: AccesoRapido[] = [];

  mostrarDashboard = false;
  cargandoDash = false;
  data: any = null;
  private charts: any[] = [];

  // Catálogo de accesos rápidos. Cada uno se muestra solo si el usuario tiene
  // permiso sobre el módulo (misma clave que el sidebar). Los soloAdmin solo al ADMINISTRADOR.
  private readonly todosAccesos: AccesoRapido[] = [
    { clave: 'PRODUCTOS', label: 'Productos', ruta: '/Producto', icon: 'fa fa-product-hunt', color: '#1976d2' },
    { clave: 'PAGO NOTA VENTA', label: 'Nota de Venta', ruta: '/Nota-Venta', icon: 'mdi mdi-square-inc-cash', color: '#2e7d32' },
    { clave: 'VENTAS', label: 'Ventas', ruta: '/Ventas', icon: 'mdi mdi-note-multiple', color: '#00897b' },
    { clave: 'CAJA', label: 'Caja', ruta: '/Caja', icon: 'mdi mdi-clipboard-flow', color: '#6d4c41' },
    { clave: 'PEDIDOS', label: 'Pedidos', ruta: '/Pedidos', icon: 'mdi mdi-book', color: '#5e35b1' },
    { clave: 'REPORTE VENTA PRODUCTO', label: 'Reporte de Ventas', ruta: '/Venta-Producto', icon: 'mdi mdi-chart-bar', color: '#c62828' },
    { clave: 'LIBRO VENTAS', label: 'Libro de Ventas', ruta: '/Libro-Ventas', icon: 'mdi mdi-book-open-page-variant', color: '#ad1457' },
    { clave: 'USUARIO', label: 'Usuarios', ruta: '/Usuario', icon: 'fa fa-user-plus', color: '#455a64', soloAdmin: true },
    { clave: 'PERMISOS', label: 'Permisos', ruta: '/Permisos', icon: 'fa fa-lock', color: '#ef6c00', soloAdmin: true },
  ];

  constructor(
    private http: HttpClient,
    private servicio_login: LoginService,
    private cdr: ChangeDetectorRef,
    public permiso: PermisoService,
  ) {
    this.identificacion = this.servicio_login.getIdentity() || {};
  }

  ngOnInit(): void {
    // Cierra el modal de "sesión activada" si quedó abierto al entrar.
    const elemento: any = document.querySelector("[data-dismiss='modal']");
    if (elemento) {
      elemento.click();
    }

    this.fechaHoy = this.formatearFecha();
    this.saludo = this.calcularSaludo();
    this.accesos = this.todosAccesos.filter((a) =>
      a.soloAdmin ? this.permiso.esAdministrador() : this.permiso.puedeVer(a.clave)
    );
    // El dashboard de ventas se muestra al admin o a quien tenga módulos de venta/reporte.
    this.mostrarDashboard =
      this.permiso.esAdministrador() ||
      this.permiso.puedeVerAlguno(['REPORTE VENTA PRODUCTO', 'LIBRO VENTAS', 'VENTAS', 'CAJA', 'PAGO NOTA VENTA']);
  }

  ngAfterViewInit(): void {
    if (this.mostrarDashboard) {
      this.cargarDashboard();
    }
  }

  ngOnDestroy(): void {
    this.destruirCharts();
  }

  get nombreCompleto(): string {
    const n = this.identificacion?.nombre || '';
    const ap = this.identificacion?.apellido_paterno || '';
    return (n + ' ' + ap).trim();
  }

  private cargarDashboard(): void {
    this.cargandoDash = true;
    const headers = new HttpHeaders().set('Authorization', this.servicio_login.getToken());
    this.http.get<any>(environment.api_url + '&controller=Dashboard&action=resumen', { headers }).subscribe({
      next: (resp) => {
        this.data = resp;
        this.cargandoDash = false;
        this.cdr.detectChanges(); // asegura que los contenedores de los gráficos ya estén en el DOM
        this.renderCharts();
      },
      error: () => {
        this.cargandoDash = false;
      },
    });
  }

  private renderCharts(): void {
    this.destruirCharts();
    const azul = '#1976d2';
    const paleta = ['#5A8DEE', '#39DA8A', '#FDAC41', '#FF5B5C', '#00CFDD', '#9C27B0', '#8D6E63', '#26A69A'];
    const moneda = (v: number) => 'S/ ' + (v || 0).toFixed(2);

    // --- Ventas por mes (barras) ---
    const elMes = document.querySelector('#chartPorMes');
    if (elMes && this.data?.por_mes) {
      const opts: any = {
        chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit' },
        series: [{ name: 'Ventas', data: (this.data.por_mes.data || []).map((v: any) => Number(v) || 0) }],
        xaxis: { categories: this.data.por_mes.labels },
        colors: [azul],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
        dataLabels: { enabled: false },
        yaxis: { labels: { formatter: (v: number) => 'S/ ' + (v || 0).toFixed(0) } },
        tooltip: { y: { formatter: moneda } },
        grid: { borderColor: '#eee' },
      };
      const ch = new ApexCharts(elMes, opts);
      ch.render();
      this.charts.push(ch);
    }

    // --- Ventas por vendedor (dona) — solo admin ---
    const elUsr = document.querySelector('#chartPorUsuario');
    if (elUsr && this.data?.es_admin && this.data?.por_usuario?.data?.length) {
      const opts: any = {
        chart: { type: 'donut', height: 300, fontFamily: 'inherit' },
        series: (this.data.por_usuario.data || []).map((v: any) => Number(v) || 0),
        labels: this.data.por_usuario.labels,
        colors: paleta,
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(1) + '%' },
        tooltip: { y: { formatter: moneda } },
      };
      const ch = new ApexCharts(elUsr, opts);
      ch.render();
      this.charts.push(ch);
    }

    // --- Top productos (barras horizontales) ---
    const elTop = document.querySelector('#chartTopProductos');
    if (elTop && this.data?.top_productos?.data?.length) {
      const opts: any = {
        chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit' },
        series: [{ name: 'Vendido', data: (this.data.top_productos.data || []).map((v: any) => Number(v) || 0) }],
        xaxis: { categories: this.data.top_productos.labels },
        colors: ['#39DA8A'],
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: moneda } },
        grid: { borderColor: '#eee' },
      };
      const ch = new ApexCharts(elTop, opts);
      ch.render();
      this.charts.push(ch);
    }
  }

  private destruirCharts(): void {
    this.charts.forEach((c) => {
      try { c.destroy(); } catch { /* noop */ }
    });
    this.charts = [];
  }

  get sinVentasMes(): boolean {
    return !!this.data && (!this.data.cards || this.data.cards.cantidad_mes === 0);
  }

  private formatearFecha(): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const d = new Date();
    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  }

  private calcularSaludo(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

}
