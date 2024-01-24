import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import * as ApexCharts from 'apexcharts';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HelpersService } from 'src/app/services/helpers.service';
import { LoginService } from 'src/app/services/login.service';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-venta-producto',
  templateUrl: './reporte-venta-producto.component.html',
  styleUrls: ['./reporte-venta-producto.component.css'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ReporteVentaProductoComponent implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  productovendidos: any = [];
  filtrarForm!: FormGroup;
  token: any;
  identity: any;
  currentChart: ApexCharts | null = null;
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private servicio_login: LoginService,
    private helper: HelpersService
  ) {
    const today = new Date();
    const formattedDate = this.helper.formatDate(today);
    this.token = this.servicio_login.getToken();
    this.identity = this.servicio_login.getIdentity();
    this.filtrarForm = this.fb.group({
      fecha_inicio: [formattedDate],
      fecha_fin: [formattedDate],
      id_usuario:[this.identity.sub]
    });
  }

  ngOnInit(): void {
    this.dtOptions[0] = this.createDtOptions();
  }

  ngOnDestroy(): void {
    this.reload_producto.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.reload_producto.next();//FRENAMOS LA TABLA PARA QUE INICIALICE EL DATATABLE
  }

  createDtOptions(): any {
    let headers = new HttpHeaders().set('Authorization', this.token);
    return {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      destroy: true,
      ordering: false,
      language: {
        processing: "Procesando...",
        lengthMenu: "Mostrar _MENU_ registros",
        zeroRecords: "No se encontraron resultados",
        emptyTable: "Ningún dato disponible en esta tabla",
        info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
        infoFiltered: "(filtrado de un total de _MAX_ registros)",
        infoPostFix: "",
        search: "Buscar:",
        url: "",
        loadingRecords: "Cargando...",
        paginate: {
          first: "Primero",
          last: "Último",
          next: "Siguiente",
          previous: "Anterior"
        },
        aria: {
          sortAscending: "Activar para ordenar la columna de manera ascendente",
          sortDescending: "Activar para ordenar la columna de manera descendente"
        },
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        dataTablesParameters.fecha_inicio = this.filtrarForm.value.fecha_inicio;
        dataTablesParameters.fecha_fin = this.filtrarForm.value.fecha_fin;
        this.http.post<DataTablesResponse>(
          environment.api_url + "&controller=ReporteVentaProducto&action=tablaReporteVenta",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          this.productovendidos = resp.data;
          this.renderizarPastel();//CREAMOS EL DIAGRAMA DE PASTEL
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          });
        });
      },
      order: [],
      columns: [
        {
          width: "33%"
        },
        {
          width: "33%"
        },
        {
          width: "33%"
        }
      ],
    };
  }
  Filtrar() {
    this.ngAfterViewInit();
  }
  ExportarExcel(){
    let myHeaders = new Headers();
    myHeaders.append("Authorization", this.token);
    let parameters = new FormData();
    parameters.append("fecha_inicio", this.filtrarForm.value.fecha_inicio);
    parameters.append("fecha_fin", this.filtrarForm.value.fecha_fin);
    parameters.append("id_usuario", this.filtrarForm.value.id_usuario);
    let requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      body: parameters,
    };
    Swal.fire({
      title: 'Ventas Productos',
      html: 'Exportando el excel ...',
      text: 'Exportando el excel ...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        fetch(environment.api_url + "&controller=ReporteVentaProducto&action=exportarProductoVenta", requestOptions)
          .then(response => response.blob())
          .then(blob => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = `Ventas_Productos.xlsx`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();
            Swal.close();
          })
          .catch(error => console.log('error', error));
      },
    });
  }
  renderizarPastel() {
    if (this.currentChart) {
      this.currentChart.destroy();
    }
    // Renderizar el gráfico con los datos dinámicos
    const datosDinamicos = this.obtenerDatosDinamicos();
    this.currentChart = this.renderChart(datosDinamicos);
    this.currentChart?.render();
  }

  renderChart(datos: { labels: string[], data: number[] }): any {
    const [$primary, $success, $danger, $warning, $info, $label_color_light] = [
      '#5A8DEE',
      '#39DA8A',
      '#FF5B5C',
      '#FDAC41',
      '#00CFDD',
      '#E6EAEE'
    ];
  
    const themeColors = [$primary, $warning, $danger, $success, $info, $label_color_light];
    const productos = datos.labels;
    const totales = datos.data;
  
    const pieChartOptions = {
      chart: {
        type: 'pie',
        height: 320
      },
      colors: themeColors,
      labels: productos,
      series: totales,
      legend: {
        position: 'bottom',
        horizontalAlign: 'center', // Ajusta según sea necesario
        itemMargin: {
          horizontal: 2,
        },
        itemWrap: true,
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              width: 300
            },
          }
        }
      ]
    };
  
    const pieChart = new ApexCharts(document.querySelector("#piechart"), pieChartOptions);
  
    return pieChart;
  }

  obtenerDatosDinamicos(): { labels: string[], data: number[] } {
    //SEPARA MOS LA GLOSA Y LA CANTIDAD 
    const glosaProductos = this.productovendidos.slice(0, 10).map((item: any) => item.glosa_producto);
    const cantidades = this.productovendidos.slice(0, 10).map((item: any) => item.cantidad_negocio_detalle);
    return {
      labels: glosaProductos,
      data: cantidades
    };
  }
}
