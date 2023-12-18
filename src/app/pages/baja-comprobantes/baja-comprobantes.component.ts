import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { Totales } from 'src/app/interface/Datos';
import { AnularService } from 'src/app/services/anular.service';
import { LoginService } from 'src/app/services/login.service';
import { NotaVenta } from 'src/app/services/notaventa.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
declare var document: any;
@Component({
  selector: 'app-baja-comprobantes',
  templateUrl: './baja-comprobantes.component.html',
  styleUrls: ['./baja-comprobantes.component.css']
})
export class BajaComprobantesComponent implements OnInit {
  @ViewChild('search_input_producto') search_input_producto: ElementRef | undefined;
  @ViewChild('search_input_pago') search_input_pago: ElementRef | undefined;
  @ViewChild('ruc_cliente_formulario') ruc_cliente_formulario: ElementRef | undefined;

  borrador_nota_venta: boolean = false;
  metodos_pago_nota_venta: boolean = true;
  listarDocumentos: any = [];
  token: any;
  usuario: any;

  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  ProductoBuscar!: FormGroup;
  datosanulacion!: FormGroup;
  ProductoSeleccionados: any = [];
  identificacion: any = {
    id_usuario: null,
    vendedor: ''
  };
  private unsubscribe$ = new Subject<void>();
  tipodevolucion: any = [];
  id_caja: any = null;
  id_negocio: any = null;
  Totales: Totales = {
    subtotal: 0,
    igv: 0,
    total: 0,
  }
  datos_venta: any = {
    documento: '',
    vendedor: '',
    forma_pagos: []
  }

  MontoPagarCliente: any = 0;
  id_medio_pago: any = 1;
  BuscarDocumentoLoading: boolean = false;
  Correo_pdf: string = '';
  Correo_ticket: string = '';
  url_pdf: string = '';
  url_ticket: string = '';
  busquedafactura: boolean = false;


  constructor(
    private http: HttpClient,
    private servicio_login: LoginService,
    private anular: AnularService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.token = this.servicio_login.getToken();
    this.usuario = this.servicio_login.getIdentity();
    this.ProductoBuscar = this.fb.group({
      glosa_producto: ['']
    });

    this.datosanulacion = this.fb.group({
      id_documento: [''],
      tipo_documento: [''],
      tipo_anulacion: ['', [Validators.required]],
      comentario: [''],
      fecha_devolucion: [new Date().toISOString().substring(0, 10)],
      documento: ['NOTA CREDTIO'],
      id_usuario: [this.usuario.sub]
    });

  }

  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.Mostrar_Productos();
    this.Mostrar_TipoDevolucion();
  }

  ngAfterViewInit(): void {
    this.search_input_producto?.nativeElement.focus();
    this.reload_producto.next();
  }

  ngOnDestroy(): void {
    this.reload_producto.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  Mostrar_Productos() {
    let headers = new HttpHeaders()
      .set('Authorization', this.token);
    this.dtOptions[0] = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      ordering: false,
      searching: false,
      paging: false,
      destroy: true,
      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        if (this.ProductoBuscar.value.glosa_producto) {
          dataTablesParameters.filtro_buscar = this.ProductoBuscar.value.glosa_producto;
        }
        this.http.post<DataTablesResponse>(
          environment.api_url + "?controller=AnularDocumento&action=listaDocumentoElectronicos",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          this.listarDocumentos = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          });
        });
      },
      columns: [
        {
          width: "100%"
        }
      ],
    };
  }

  Mostrar_TipoDevolucion() {
    this.anular.TraerMotivoDevolucion().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.tipodevolucion = resp;
      },
      error: error => {
        this.toast.error(`No hay tipo devolucion! ${error.JSON}`, 'Verificar');

      }
    })
  }

  BuscarProductos() {
    this.reload_producto.next();
  }

  EnviarProducto(datos: any) {
    let id_documento = null;
    let tipo_documento = null;
    if (datos.id_boleta) {
      id_documento = datos.id_boleta;
      tipo_documento = 'BOLETA';
    } else {
      id_documento = datos.id_factura;
      tipo_documento = 'FACTURA';
    }
    this.datosanulacion.get('tipo_documento')?.setValue(tipo_documento);
    this.datosanulacion.get('id_documento')?.setValue(id_documento);
    this.anular.TraerDocumento(id_documento, tipo_documento).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.ProductoSeleccionados = resp.datos;
        this.Totales.subtotal = resp.subtotal;
        this.Totales.igv = resp.igv;
        this.Totales.total = resp.total;
        this.datos_venta = resp.datos_venta;
        this.identificacion.id_usuario = resp.datos_venta.id_usuario;
        this.identificacion.vendedor = resp.datos_venta.vendedor;

      }, error: error => {
        this.toast.error(`No hay documento!`, 'Verificar');
        return;
      }
    })

    $("#tabla-detalle-negocio").scrollTop(document.getElementById('tabla-detalle-negocio').scrollHeight);

  }
  eliminarFila(indice: any) {
    this.ProductoSeleccionados.splice(indice, 1);
  }

  EscribirProducto(e: any) {
    if (e.keyCode == 13) {
      this.BuscarProductos();
    }
  }

  EnviarAnular() {
    if (this.ProductoSeleccionados.length == 0) {
      this.toast.error(`No hay productos!`, 'Verificar');
      return;
    }
    this.search_input_pago?.nativeElement.focus();
    this.borrador_nota_venta = true;
    this.metodos_pago_nota_venta = false;
    setTimeout(() => {
      this.search_input_pago?.nativeElement.focus();
    }, 500);
  }

  VolverPagina() {
    this.borrador_nota_venta = false;
    this.metodos_pago_nota_venta = true;
    setTimeout(() => {
      this.search_input_producto?.nativeElement.focus();
    }, 500);
  }
  ConfirmarAnulacion() {
    if (this.ProductoSeleccionados.length == 0) {
      this.toast.error(`No hay productos`, undefined, {
        timeOut: 3000,
      });
      return;
    }

    if (this.datosanulacion.value.documento == "ANULAR" && this.datosanulacion.value.tipo_documento === "BOLETA") {
      this.toast.error(`No puede anular Boletas `, 'Documento', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
      return;
    }

    this.datosanulacion.markAllAsTouched();
    if (this.datosanulacion.invalid) {
      this.toast.error(`Campos obligatorio `, 'Validación', {
        timeOut: 2000,
        positionClass: 'toast-top-right',
      });
      return;
    }
    Swal.fire({
      title: 'Comprobante',
      html: 'Generando Comprobante...',
      text: 'Generando Comprobante...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        Swal.showLoading();
        this.anular.GenerarDocumento(this.datosanulacion.value).pipe(takeUntil(this.unsubscribe$)).subscribe({
          next: respuesta => {
            this.url_pdf = respuesta.pdf;
            this.url_ticket = respuesta.ticket;
            var htmlticket = `<embed src="${respuesta.ticket}" frameborder="0" width="100%" height="400px">`;
            $("#viewjs2_negocio").html(htmlticket);
            var htmlpdf = `<embed src="${respuesta.pdf}" frameborder="0" width="100%" height="400px">`;
            $("#viewjs_negocio").html(htmlpdf);
            $(".imprimirTicket").addClass('active');
            $(".imprimirTicketcontent").addClass('active');
            $('#ajax-mostrar-pdf').modal('show');
            Swal.close();
          },
          error: error => {
            Swal.fire({
              toast: true,
              position: 'top',
              icon: 'error',
              title: `Error al emitir el documento.`,
              showConfirmButton: false,
              timerProgressBar: true,
              timer: 5000
            })
            Swal.close();
          }
        })
      },
    });
  }

  LimpiarInformacion() {
    this.ProductoSeleccionados = [];
    this.Totales.igv = 0;
    this.Totales.subtotal = 0;
    this.Totales.total = 0;
    this.VolverPagina();
  }
  tipoComprobante() {

  }


  LimpiarModalNegocio() {
    $('#ajax-mostrar-pdf').modal('hide');
    $("#viewjs2_negocio").html('');
    $("#viewjs_negocio").html('');
    $(".imprimirTicket").removeClass('active');
    $(".imprimirTicketcontent").removeClass('active');
    $(".imprimirBoletaAfectaContent ").removeClass('active');
    $(".imprimirBoletaAfecta").removeClass('active');
    this.LimpiarInformacion();
    this.reload_producto.next();
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
      url_ticket: this.url_ticket
    }
    Swal.fire({
      title: 'Espere',
      html: 'Enviando email del Cliente...',
      text: 'Enviando email del Cliente...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        Swal.showLoading();
        this.anular.EnviarCorreloElectronicoEmail(datos).pipe(takeUntil(this.unsubscribe$)).subscribe({
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

}
