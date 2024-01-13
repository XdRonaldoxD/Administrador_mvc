import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subject, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { Caja } from 'src/app/services/caja.service';
import { CategoriaService } from 'src/app/services/categoria.service';
import { LoginService } from 'src/app/services/login.service';
import { NotaVenta } from 'src/app/services/notaventa.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { ProductoService } from 'src/app/services/producto.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('cantidad') cantidad!: ElementRef;
  today: Date = new Date();
  pipe = new DatePipe('en-US');

  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  Unsuscribe: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  ListarCajaHabilitados: any = [];

  FiltroCajaBuscar!: FormGroup;

  tipo_inventario?: any = [];
  color: any;
  Producto: any;
  tipo_movimiento: any = null;
  usuario: any = null;
  estado_pedido: any = [];
  estado_pago: any = [];
  estado_preparacion: any = [];
  resume_ventas: any = [];
  id_caja: any = null;
  lista_resumen_caja: boolean = false;

  Respuesta_detalle: any = false;
  mostrar_documento: any = false;
  MetodosPagos: any = [];
  DetalleVentasProductos: any = [];
  Correo_pdf: string = '';
  Correo_ticket: string = '';
  url_pdf: string = ``;
  url_ticket: string = ``;
  documento: string = '';
  constructor(
    private http: HttpClient,
    private servicio_login: LoginService,
    private fb: FormBuilder,
    private servicio_caja: Caja,
    private nota_venta: NotaVenta,
    private toast: ToastrService
  ) {
    this.usuario = servicio_login.getIdentity();
    this.FiltroCajaBuscar = this.fb.group({
      pos_negocio: [''],
      fechacreacion_negocio_fin: [this.pipe.transform(Date.now(), 'yyyy-MM-dd'), Validators.required],
      fechacreacion_negocio_inicio: [this.pipe.transform(Date.now(), 'yyyy-MM-dd'), Validators.required]
    });


  }
  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.token = this.servicio_login.getToken();
    //HABILITADO 1
    this.ListarCaja();
  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_producto
  //SOLO LLAMAR LA FUNCION => this.reload_producto.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)
    this.reload_producto.unsubscribe();
    this.reload_producto_deshabilitado.unsubscribe();
    this.Unsuscribe.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.reload_producto.next();
    this.reload_producto_deshabilitado.next();
  }
  //FIN
  buscar() {
    this.reload_producto.next();
    this.reload_producto_deshabilitado.next();
  }

  VerPagos(id_negocio_global: any) {
    this.servicio_caja.TraerPagos(id_negocio_global).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        this.MetodosPagos = resp;
        $("#nuevaCajaModal").modal("show");
      },
      error: error => {

      }
    })



  }


  ListarCaja() {
    //posicion es para el datatable

    let headers = new HttpHeaders()
      .set('Authorization', this.token);
    this.dtOptions[0] = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      destroy: true,
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
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.pos_negocio = this.FiltroCajaBuscar.value.pos_negocio;
        dataTablesParameters.fechacreacion_negocio_inicio = this.FiltroCajaBuscar.value.fechacreacion_negocio_inicio;
        dataTablesParameters.fechacreacion_negocio_fin = this.FiltroCajaBuscar.value.fechacreacion_negocio_fin;
        this.http.post<DataTablesResponse>(
          environment.api_url + "&controller=Venta&action=ListarVentas",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          this.ListarCajaHabilitados = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          });
        });
      },
      ordering: false,
      columns: [
        {
          width: "20%"
        },
        {
          width: "20%"
        },
        {
          width: "20%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "20%"
        }


      ],
    };
  }




  MostrarDetalleProducto(id_negocio: any) {
    this.servicio_caja.MostrarDetalleProducto(id_negocio).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        $("#detalle_ventas_producto").modal("show");
        this.DetalleVentasProductos = resp;
      }, error: error => {
        this.DetalleVentasProductos = [];
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'Error al verificar el detalle.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }
    });

  }



  VisualizarPdf(item: any) {
    Swal.fire({
      title: 'Comprobante',
      html: 'Generando Comprobante del Cliente...',
      text: 'Generando Comprobante del Cliente...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        $(".imprimirTicket").addClass('active');
        $(".imprimirTicketcontent").addClass('active');
        $('#ajax-mostrar-pdf').modal('show');
        if (item.id_nota_venta) {
          this.documento = "NOTA VENTA";
          var htmlpdf = `<iframe  src="${item.ruta_archivo}/NOTA_VENTA/${item.urlpdf_nota_venta}" frameborder="0" width="100%" height="400px"></iframe>`;
          $("#viewjs_negocio").html(htmlpdf);
          this.url_pdf = `${item.ruta_archivo}/NOTA_VENTA/${item.urlpdf_nota_venta}`;
          this.url_ticket = `${item.ruta_archivo}/NOTA_VENTA/${item.urlticket_nota_venta}`;
        }
        if (item.id_boleta) {
          this.documento = "BOLETA";
          var htmlpdf = `<iframe  src="${item.ruta_archivo}/BOLETA/${item.path_boleta}" frameborder="0" width="100%" height="400px"></iframe>`;
          $("#viewjs_negocio").html(htmlpdf);
          this.url_pdf = `${item.ruta_archivo}/BOLETA/${item.path_boleta}`;
          this.url_ticket = `${item.ruta_archivo}/BOLETA/${item.path_ticket_boleta}`;
        }
        if (item.id_factura) {
          this.documento = "FACTURA";
          var htmlpdf = `<iframe  src="${item.ruta_archivo}/FACTURA/${item.path_documento}" frameborder="0" width="100%" height="400px"></iframe>`;
          $("#viewjs_negocio").html(htmlpdf);
          this.url_pdf = `${item.ruta_archivo}/FACTURA/${item.path_documento}`;
          this.url_ticket = `${item.ruta_archivo}/FACTURA/${item.path_ticket_factura}`;
        }
        Swal.close();
      },
    });

  }


  EnviarDocumento(formato: string) {
    if (formato === "TICKET") {
      if (this.Correo_ticket === '') {
        this.toast.error(`Llenar el campo email`, 'Error', {
          timeOut: 2000,
          positionClass: 'toast-top-right',
        });
        return;
      }
    } else {
      if (this.Correo_pdf === '') {
        this.toast.error(`Llenar el campo email`, 'Error', {
          timeOut: 2000,
          positionClass: 'toast-top-right',
        });
        return;
      }
    }
    let datos = {
      formato: formato,
      Correo_pdf: this.Correo_pdf,
      Correo_ticket: this.Correo_ticket,
      url_pdf: this.url_pdf,
      url_ticket: this.url_ticket,
      tipo_documento: this.documento
    }
    Swal.fire({
      title: 'Espere',
      html: 'Enviando email del Cliente...',
      text: 'Enviando email del Cliente...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        Swal.showLoading();
        this.nota_venta.EnviarCorreloElectronicoEmail(datos).pipe(takeUntil(this.Unsuscribe)).subscribe({
          next: resp => {
            this.toast.success(`Enviando correctamente `, 'Email', {
              timeOut: 2000,
              positionClass: 'toast-top-right',
            });
            Swal.close();
          },
          error: erro => {
            this.toast.error(`Ubo un error al enviar el correo`, 'Error', {
              timeOut: 2000,
              positionClass: 'toast-top-right',
            });
            Swal.close();
          }
        })

      },
    });

  }

  LimpiarModalNegocio() {
    $('#ajax-mostrar-pdf').modal('hide');
    $("#viewjs_negocio").html('');
    $(".imprimirTicket").removeClass('active');
    $(".imprimirTicketcontent").removeClass('active');
    $(".imprimirBoletaAfectaContent ").removeClass('active');
    $(".imprimirBoletaAfecta").removeClass('active');
  }






}
