import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { Caja } from 'src/app/services/caja.service';
import { CategoriaService } from 'src/app/services/categoria.service';
import { LoginService } from 'src/app/services/login.service';
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
  MetodosPagos:any=[];
  DetalleVentasProductos:any=[];
  constructor(
    private http: HttpClient,
    private servicio_login: LoginService,
    private fb: FormBuilder,
    private servicio_caja: Caja
  ) {
    this.usuario = servicio_login.getIdentity();
    this.FiltroCajaBuscar = this.fb.group({
      pos_negocio:[''],
      fechacreacion_negocio_fin: [this.pipe.transform(Date.now(), 'yyyy-MM-dd'), Validators.required],
      fechacreacion_negocio_inicio: [this.pipe.transform(Date.now(), 'yyyy-MM-dd'), Validators.required]
    });
  

  }
  ngOnInit(): void {
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

  VerPagos(id_negocio_global:any) {
    this.servicio_caja.TraerPagos(this.token,id_negocio_global).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next:resp=>{
        this.MetodosPagos=resp;
        $("#nuevaCajaModal").modal("show");
      },
      error:error=>{

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

      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.pos_negocio =  this.FiltroCajaBuscar.value.pos_negocio;
        dataTablesParameters.fechacreacion_negocio_inicio = this.FiltroCajaBuscar.value.fechacreacion_negocio_inicio;
        dataTablesParameters.fechacreacion_negocio_fin = this.FiltroCajaBuscar.value.fechacreacion_negocio_fin;
        this.http.post<DataTablesResponse>(
          environment.api_url + "?controller=Venta&action=ListarVentas",
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
      order: [],
      columns: [
        {
          width: "10%"
        },
        {
          width: "10%"
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
    this.servicio_caja.MostrarDetalleProducto(this.token,id_negocio).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        $("#detalle_ventas_producto").modal("show");
        this.DetalleVentasProductos = resp;
      }, error: error => {
        this.DetalleVentasProductos =[];
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
        Swal.showLoading();
        if (item.id_nota_venta) {
          var htmlticket = `<embed src="${item.ruta_archivo}/NOTA_VENTAVENTA/${item.urlticket_nota_venta}" frameborder="0" width="100%" height="400px">`;
          $("#viewjs2_negocio").html(htmlticket);
          var htmlpdf = `<embed src="${item.ruta_archivo}/NOTA_VENTAVENTA/${item.urlpdf_nota_venta}" frameborder="0" width="100%" height="400px">`;
          $("#viewjs_negocio").html(htmlpdf);
        }
        if (item.id_boleta) {
          var htmlticket = `<embed src="${item.ruta_archivo}/BOLETAVENTA/${item.path_ticket_boleta}" frameborder="0" width="100%" height="400px">`;
          $("#viewjs2_negocio").html(htmlticket);
          var htmlpdf = `<embed src="${item.ruta_archivo}/BOLETAVENTA/${item.path_boleta}" frameborder="0" width="100%" height="400px">`;
          $("#viewjs_negocio").html(htmlpdf);
        }
        if (item.id_factura) {
          var htmlticket = `<embed src="${item.ruta_archivo}/FACTURAVENTA/${item.path_ticket_factura}" frameborder="0" width="100%" height="400px">`;
          $("#viewjs2_negocio").html(htmlticket);
          var htmlpdf = `<embed src="${item.ruta_archivo}/FACTURAVENTA/${item.path_documento}" frameborder="0" width="100%" height="400px">`;
          $("#viewjs_negocio").html(htmlpdf);
        }
        $(".imprimirTicket").addClass('active');
        $(".imprimirTicketcontent").addClass('active');
        setTimeout(() => {
          $('#ajax-mostrar-pdf').modal('show');
          Swal.close();
        }, 1500);
      },
    });

  }

  LimpiarModalNegocio() {
    $('#ajax-mostrar-pdf').modal('hide');
    $("#viewjs2_negocio").html('');
    $("#viewjs_negocio").html('');
    $(".imprimirTicket").removeClass('active');
    $(".imprimirTicketcontent").removeClass('active');
    $(".imprimirBoletaAfectaContent ").removeClass('active');
    $(".imprimirBoletaAfecta").removeClass('active');
  }


  



}
