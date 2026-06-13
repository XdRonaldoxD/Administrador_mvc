import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent implements AfterViewInit, OnDestroy, OnInit {
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
  ListarCajaHabilitadosDeshabilitado: any = [];
  FiltroCajaBuscar!: FormGroup;
  CajaNueva!: FormGroup;
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
  detalle_resumen_caja: boolean = true;
  Respuesta_detalle: any = false;
  mostrar_documento: any = false;
  Correo_pdf: string = '';
  Correo_ticket: string = '';
  // [FIX PDF móvil] URLs de los comprobantes ESTÁTICOS (NOTA VENTA/BOLETA/FACTURA)
  // que se renderizan con app-extended-pdf (pdf.js), que sí se ve en celular.
  url_pdf: string = '';
  url_ticket: string = '';
  // [FIX PDF móvil] Flag para distinguir el modo del modal #ajax-mostrar-pdf:
  //  - false => comprobantes estáticos: usa app-extended-pdf (url_pdf/url_ticket).
  //  - true  => detalle de caja (PDF dinámico de API): mantiene <embed> porque el
  //             endpoint genera el PDF al vuelo y puede NO soportar fetch con Range.
  caja_dinamica: boolean = false;
  constructor(private http: HttpClient,
    private servicio_login: LoginService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private servicio_producto: ProductoService,
    private servicio_pedido: PedidoService,
    private servicio_caja: Caja,
    private zone: NgZone
  ) {
    
    this.usuario = servicio_login.getIdentity();
    this.FiltroCajaBuscar = this.fb.group({
      fechacreacion_caja_fin: [this.pipe.transform(Date.now(), 'yyyy-MM-dd'), Validators.required],
      fechacreacion_caja_inicio: [this.pipe.transform(Date.now(), 'yyyy-MM-dd'), Validators.required]
    });
    this.CajaNueva = this.fb.group({
      id_usuario: [this.usuario.sub, [Validators.required]],
      montoinicial_caja: [0, [Validators.required]],
    });

  }
  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.token = this.servicio_login.getToken();
    //HABILITADO 1
    this.ListarCaja(1);
    //DESHABILITADO O HISTORICOS 0
    this.ListarCaja(0);

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });

    this.servicio_pedido.ListaProductosRelacionado(this.token).pipe(finalize(() => {
      $(function () {
        $('.selectpicker').selectpicker();
      });

    })).subscribe({
      next: (res) => {
        this.estado_pedido = res.EstadoPedido;
        this.estado_pago = res.EstadoPago;
        this.estado_preparacion = res.EstadoPreparacion;
      },
      error: (error) => {

      }
    })
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

  CrearNuevaCaja() {
    this.servicio_caja.VerificarCajaAbierta(this.usuario.sub).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        $("#nuevaCajaModal").modal("show");
      }, error: error => {
        this.toast.error(`Debe cerrar su caja abierta`, undefined, {
          timeOut: 3000,
        });
      }
    })
 
  }
  GuardarCaja() {
    this.servicio_caja.GuardarCaja(this.CajaNueva.value).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: 'Caja creado con exito.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
        $("#nuevaCajaModal").modal("hide");
        this.buscar();

      }, error: error => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'Error al crear la caja.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }
    })
  }

  ListarCaja(estado: any) {
    //posicion es para el datatable
    let posicion = 0;
    if (estado === 0) {
      posicion = 1;
    }
    let headers = new HttpHeaders()
      .set('Authorization', this.token);
    this.dtOptions[posicion] = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      destroy: true,
      ordering: false,
      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.estado = estado;
        dataTablesParameters.fechacreacion_caja_inicio = this.FiltroCajaBuscar.value.fechacreacion_caja_inicio;
        dataTablesParameters.fechacreacion_caja_fin = this.FiltroCajaBuscar.value.fechacreacion_caja_fin;
        this.http.post<DataTablesResponse>(
          environment.api_url + "&controller=Caja&action=ListaCaja_Habilitado_Deshabilitado",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          if (posicion == 0) {
            this.ListarCajaHabilitados = resp.data;
          }
          if (posicion == 1) {
            this.ListarCajaHabilitadosDeshabilitado = resp.data;
          }
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
          width: "20%"
        },
        {
          width: "10%"
        },
        {
          width: "20%"
        },
        {
          width: "20%"
        }

      ],
    };
  }


  TraerDetalleCaja(id_caja: any) {
    this.id_caja = id_caja;
    this.servicio_caja.TraerDetalleCaja(id_caja).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        this.lista_resumen_caja = true;
        this.detalle_resumen_caja = false;
        this.Respuesta_detalle = resp;
      }, error: error => {

      }
    })
  }

  MostrarDocumento(item: any) {
    this.servicio_caja.MostrarDocumentos(this.id_caja, item.documento, item.id_medio_pago).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        this.mostrar_documento = resp;
      }, error: error => {
        this.mostrar_documento = null;
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'Error al verificar los documentos.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }
    });

  }


  GestionActivoDesactivadoProducto(accion: string, id_producto: number) {
    let texto;
    if (accion == 'ACTIVAR') {
      texto = "activar";
    } else {
      texto = "deshabilitar";
    }
    Swal.fire({
      title: `¿Estas seguro de ${texto} producto?`,
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (accion == 'ACTIVAR') {
          this.servicio_producto.GestionActivoDesactivadoProducto(accion, id_producto).pipe(finalize(() => {
            this.reload_producto.next();
            this.reload_producto_deshabilitado.next();
          })).subscribe({
            next: (res) => {
              Swal.fire(
                'Listo!',
                'Producto Activado con Exito.',
                'success'
              )
            },
            error: (error) => {

            }
          })
        } else {
          this.servicio_producto.GestionActivoDesactivadoProducto(accion, id_producto).pipe(finalize(() => {
            this.reload_producto.next();
            this.reload_producto_deshabilitado.next();
          })).subscribe({
            next: (res) => {
              Swal.fire(
                'Listo!',
                'Producto Deshabilitado con Exito.',
                'success'
              )
            },
            error: (error) => {

            }
          })
        }

      }
    })

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
        // [FIX PDF móvil] Comprobantes ESTÁTICOS: se arman las URLs (pdf=A4, ticket)
        // y se muestran con app-extended-pdf (pdf.js). Antes se inyectaban con <embed>
        // vía jQuery, que no se ve en celular.
        let pdf = '';
        let ticket = '';
        if (item.id_nota_venta) {
          pdf = `${item.ruta_archivo}/NOTA VENTA/${item.urlpdf_nota_venta}`;
          ticket = `${item.ruta_archivo}/NOTA VENTA/${item.urlticket_nota_venta}`;
        }
        if (item.id_boleta) {
          pdf = `${item.ruta_archivo}/BOLETA/${item.path_boleta}`;
          ticket = `${item.ruta_archivo}/BOLETA/${item.path_ticket_boleta}`;
        }
        if (item.id_factura) {
          pdf = `${item.ruta_archivo}/FACTURA/${item.path_documento}`;
          ticket = `${item.ruta_archivo}/FACTURA/${item.path_ticket_factura}`;
        }
        this.caja_dinamica = false;
        $(".imprimirTicket").addClass('active');
        $(".imprimirTicketcontent").addClass('active');
        // El visor pdf.js SOLO se crea cuando el modal está completamente visible
        // (shown.bs.modal); si se crea durante el fade-in, mide 0 px de alto y sale en blanco.
        const modalPdf = $('#ajax-mostrar-pdf');
        modalPdf.off('shown.bs.modal.verpdf').on('shown.bs.modal.verpdf', () => {
          this.zone.run(() => {
            this.url_pdf = encodeURI(pdf);       // encodeURI por el espacio de "NOTA VENTA"
            this.url_ticket = encodeURI(ticket);
          });
        });
        setTimeout(() => {
          modalPdf.modal('show');
          Swal.close();
        }, 1500);
      },
    });

  }

  private escapeHtml(value: any): string {
    if (value === null || value === undefined) { return ''; }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  LimpiarModalNegocio() {
    $('#ajax-mostrar-pdf').modal('hide');
    // [FIX PDF móvil] Reset del modo estático (app-extended-pdf) y del dinámico (embed).
    this.url_pdf = '';
    this.url_ticket = '';
    this.caja_dinamica = false;
    $("#viewjs2_negocio_caja").html('');
    $("#viewjs_negocio_caja").html('');
    $(".imprimirTicket").removeClass('active');
    $(".imprimirTicketcontent").removeClass('active');
    $(".imprimirBoletaAfectaContent ").removeClass('active');
    $(".imprimirBoletaAfecta").removeClass('active');
  }

  Volver() {
    this.lista_resumen_caja = false;
    this.detalle_resumen_caja = true;
  }
  ImprimirCaja() {
    Swal.fire({
      title: 'Comprobante',
      html: 'Generando Comprobante...',
      text: 'Generando Comprobante...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        Swal.showLoading();
        // [FIX PDF móvil] CASO DINÁMICO (detalle de caja): el endpoint PHP genera el
        // PDF al vuelo y puede NO soportar fetch con Range, por lo que NO se usa
        // app-extended-pdf (pdf.js descarga por Range). Se mantiene <embed>, pero la
        // URL se envuelve en encodeURI. Usa contenedores propios (#..._caja) para no
        // chocar con los de app-extended-pdf del modo estático (mismo modal).
        const urlTicket = encodeURI(`${environment.api_url}&controller=Caja&action=TraerDetalleCaja&id_caja=${this.id_caja}&id_empresa=${this.usuario.id_empresa}&Formato=TICKET&Authorization=${this.token}`);
        const urlPdf = encodeURI(`${environment.api_url}&controller=Caja&action=TraerDetalleCaja&id_caja=${this.id_caja}&id_empresa=${this.usuario.id_empresa}&Formato=DOCUMENTO&Authorization=${this.token}`);
        const htmlticket = `<embed src="${urlTicket}" frameborder="0" width="100%" height="400px">`;
        const htmlpdf = `<embed src="${urlPdf}" frameborder="0" width="100%" height="400px">`;
        this.caja_dinamica = true;
        $(".imprimirTicket").addClass('active');
        $(".imprimirTicketcontent").addClass('active');
        const modalPdf = $('#ajax-mostrar-pdf');
        modalPdf.off('shown.bs.modal.verpdf').on('shown.bs.modal.verpdf', () => {
          // El flag caja_dinamica ya está en true; los contenedores propios existen.
          this.zone.run(() => {
            $("#viewjs2_negocio_caja").html(htmlticket);
            $("#viewjs_negocio_caja").html(htmlpdf);
          });
        });
        setTimeout(() => {
          modalPdf.modal('show');
          Swal.close();
        }, 1500);
      },
    });

  }

  CerrarCaja(id_caja: any) {
    let caja;
    if (id_caja) {
      caja = id_caja;
    } else {
      caja = this.id_caja;
    }
    this.servicio_caja.CerrarCaja(caja).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: 'Caja cerrado exitosamente.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
        this.Volver();
        this.buscar();
      },
      error: error => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'Error al cerrar Caja.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }
    })
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
      id_caja: this.id_caja
    }
    Swal.fire({
      title: 'Espere',
      html: 'Enviando email del Cliente...',
      text: 'Enviando email del Cliente...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        Swal.showLoading();
        this.servicio_caja.EnviarCorreoElectronico(datos).pipe(takeUntil(this.Unsuscribe)).subscribe({
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
