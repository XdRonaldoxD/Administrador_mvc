import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { Totales, Totales_pagados } from 'src/app/interface/Datos';
import { LoginService } from 'src/app/services/login.service';
import { NotaVenta } from 'src/app/services/notaventa.service';
import Swal from 'sweetalert2';

declare var $: any;
declare var document: any;
@Component({
  selector: 'app-nota-venta',
  templateUrl: './nota-venta.component.html',
  styleUrls: ['./nota-venta.component.css']
})
export class NotaVentaComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('search_input_producto') search_input_producto: ElementRef | undefined;
  @ViewChild('search_input_pago') search_input_pago: ElementRef | undefined;

  borrador_nota_venta: boolean = false;
  metodos_pago_nota_venta: boolean = true;
  listarProducto: any = [];
  token: any;
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  ProductoBuscar!: FormGroup;
  ProductoSeleccionados: any = [];
  informacionForm!: FormGroup;
  informacionFormCliente!: FormGroup;
  identificacion: any = false;
  private unsubscribe$ = new Subject<void>();
  MedioPago: any = [];
  ListaMetodosPago: any = [];
  Departamento_seleccionado: any = '';
  departamentos: any = [];
  provincias: any = [];
  distritos: any = [];
  id_caja: any = null;
  Totales: Totales = {
    subtotal: 0,
    igv: 0,
    total: 0,
  }
  Totales_pagados: Totales_pagados = {
    total_pagar: 0,
    total_pagado: 0,
    vuelto: 0,
  }
  MontoPagarCliente: any = 0;
  id_medio_pago: any = 1;
  ruc_cliente: boolean = false;
  dni_cliente: boolean = true;
  BuscarDocumentoLoading: boolean = false;
  constructor(
    private http: HttpClient,
    private servicio_login: LoginService,
    private nota_venta: NotaVenta,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.token = this.servicio_login.getToken();
    this.identificacion = this.servicio_login.getIdentity();
    this.ProductoBuscar = this.fb.group({
      glosa_producto: ['']
    });
    this.informacionForm = this.fb.group({
      cliente: [null],
      vendedor: [this.identificacion.sub],
      tipo_documento: ['NOTA_VENTA']
    });

    this.informacionFormCliente = this.fb.group({
      tipoDocumento: ['RUC', [Validators.required]],
      ruc_cliente: [''],
      dni_cliente: [''],
      nombre_razon_social: ['', [Validators.required]],
      apellido_paterno: [''],
      apellido_materno: [''],
      celular_cliente: [''],
      e_mail_cliente: [''],
      direccion_cliente: [''],
      departamento: [''],
      distrito: [''],
      provincia: [''],
      estado: [''],
      condicion: [''],
      dv_cliente: [''],
    });
  }

  ngOnInit(): void {

    this.Mostrar_Productos();
    this.Mostrar_Medio_Pago();
    $(".select2").select2();
    $("#nombre_cliente").select2({
      ajax: {
        url: "http://localhost/MVC_CRM/?controller=Cliente&action=FiltrarCliente", //URL for searching companies
        dataType: "json",
        headers: { 'Authorization': this.token },
        delay: 200,
        data: function (params: any) {
          return {
            search: params.term, //params send to companies controller
          };
        },
        processResults: function (data: any) {
          return {
            results: $.map(data, function (item: any) {
              return {
                text: item.nombre_cliente + ' ' + item.apellidopaterno_cliente + ' (' + item.documento + ')',
                id: item.id_cliente
              }
            })
          };
        },
        cache: true
      },
      language: {
        searching: function () {
          return "Buscando...";
        },
        inputTooShort: function (args: any) {
          return "Por favor ingrese 3 o más caracteres";
        }
      },
      placeholder: "Busque un cliente/ Ruc del cliente",
      minimumInputLength: 3
    });

    this.AsignarCliente();
  }

  ngAfterViewInit(): void {

    this.search_input_producto?.nativeElement.focus();
    this.reload_producto.next();

    this.nota_venta.VerificarCajaAbierta(this.token, this.identificacion.sub).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        if (resp === false) {
          Swal.fire({
            title: 'No tiene una caja Abierta.',
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: 'Abrir Caja',
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
              this.router.navigate(['Caja']);
            } else {
              this.router.navigate(['Caja']);
            }
          })
        } else {
          this.id_caja = resp
        }
      }
    })

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
          "http://localhost/MVC_CRM/?controller=NotaVenta&action=ListaProductos",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          this.listarProducto = resp.data;
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
          width: "40%"
        },
        {
          width: "10%"
        }
      ],
    };
  }

  Mostrar_Medio_Pago() {
    this.nota_venta.ListaMediosPagos(this.token).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.MedioPago = resp;
      },
      error: error => {

      }
    })
  }

  BuscarProductos() {
    this.reload_producto.next();
  }

  EnviarProducto(datos: any) {
    let existeProducto = false;
    this.ProductoSeleccionados.forEach((element: any) => {
      if (element.id_producto == datos.id_producto) {
        if ((parseInt(element.cantidad_seleccionado) + 1) > element.stock_producto) {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'error',
            title: `No hay stock del producto`,
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })
        } else {
          element.cantidad_seleccionado = parseInt(element.cantidad_seleccionado) + 1;
          element.precio_venta_producto = element.precioventa_producto * element.cantidad_seleccionado;
        }
        existeProducto = true;
      }
    });
    if (!existeProducto) {
      const mantencion = {
        cantidad_seleccionado: 1,
        precio_venta_producto: datos.precioventa_producto
      };
      Object.assign(datos, mantencion);
      this.ProductoSeleccionados.push(datos);
    }
    $("#tabla-detalle-negocio").scrollTop(document.getElementById('tabla-detalle-negocio').scrollHeight);
    this.CacularTotales();
  }
  eliminarFila(indice: any) {
    this.ProductoSeleccionados.splice(indice, 1);
    this.CacularTotales();

  }

  AumentarNumeroGeneral(e: any, indice: any) {
    let cantidad = e.target.parentElement.parentElement.firstElementChild.value;
    cantidad++;
    if (cantidad > this.ProductoSeleccionados[indice].stock_producto) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: `No hay stock del producto`,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      e.target.parentElement.parentElement.firstElementChild.value = this.ProductoSeleccionados[indice].stock_producto;
      this.ProductoSeleccionados[indice].cantidad_seleccionado = this.ProductoSeleccionados[indice].stock_producto;

      return;
    }
    e.target.parentElement.parentElement.firstElementChild.value = cantidad;
    this.ProductoSeleccionados[indice].cantidad_seleccionado = cantidad;
    this.ProductoSeleccionados[indice].precio_venta_producto = this.ProductoSeleccionados[indice].precioventa_producto * this.ProductoSeleccionados[indice].cantidad_seleccionado;
    this.CacularTotales();
  }
  DisminuirNumeroGeneral(e: any, indice: any) {
    let cantidad = e.target.parentElement.parentElement.firstElementChild.value;
    cantidad--;
    if (cantidad <= 0) {
      e.target.parentElement.parentElement.firstElementChild.value = 1;
      this.ProductoSeleccionados[indice].cantidad_seleccionado = 1;
    } else {
      e.target.parentElement.parentElement.firstElementChild.value = cantidad;
      this.ProductoSeleccionados[indice].cantidad_seleccionado = cantidad;
    }
    this.ProductoSeleccionados[indice].precio_venta_producto = this.ProductoSeleccionados[indice].precioventa_producto * this.ProductoSeleccionados[indice].cantidad_seleccionado;

    this.CacularTotales();

  }
  CantidadEscrito(e: any, indice: any) {
    let cantidad = e.target.value;
    if (cantidad <= 0) {
      cantidad = 1;
      this.ProductoSeleccionados[indice].cantidad_seleccionado = 1;
      e.target.value = 1;
    } else if (cantidad > this.ProductoSeleccionados[indice].stock_producto) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: `No hay stock del producto`,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      e.target.value = this.ProductoSeleccionados[indice].stock_producto;
      this.ProductoSeleccionados[indice].cantidad_seleccionado = this.ProductoSeleccionados[indice].stock_producto;
      return;
    } else {
      this.ProductoSeleccionados[indice].cantidad_seleccionado = cantidad;
      e.target.value = cantidad;
    }
    this.ProductoSeleccionados[indice].precio_venta_producto = this.ProductoSeleccionados[indice].precioventa_producto * this.ProductoSeleccionados[indice].cantidad_seleccionado;
    this.CacularTotales();
  }
  EscribirProducto(e: any) {
    if (e.keyCode == 13) {
      this.BuscarProductos();
    }
  }

  EscribirPago(e: any, accion: any) {
    if (this.MontoPagarCliente > 0) {
      if (e.keyCode == 13 || accion == true) {
        let MediosPago = {
          id_medio_pago: this.id_medio_pago,
          monto: this.MontoPagarCliente,
          glosa_medio_pago: $('select[name="medio_pago"] option:selected').text()
        }
        this.ListaMetodosPago.push(MediosPago);
        this.Totales_pagados.total_pagado += parseFloat(this.MontoPagarCliente);

        this.Totales_pagados.vuelto = this.Totales_pagados.total_pagado - this.Totales.total;
        if (this.Totales_pagados.vuelto < 0) {
          this.Totales_pagados.vuelto = 0;
        }
        this.MontoPagarCliente = this.Totales.total - this.Totales_pagados.total_pagado;
        this.MontoPagarCliente = Number(this.MontoPagarCliente.toFixed(2));
        if (this.MontoPagarCliente < 0) {
          this.MontoPagarCliente = 0;
        }
        this.search_input_pago?.nativeElement.focus();
      }
    }

  }
  AgregarMetodosPago() {
    let e = {
      keyCode: null
    };
    this.EscribirPago(e, true);
  }
  eliminarFilaPago(indice: any) {
    this.Totales_pagados.total_pagado -= parseFloat(this.ListaMetodosPago[indice].monto);
    this.MontoPagarCliente += parseFloat(this.ListaMetodosPago[indice].monto);
    if (this.Totales.total >= this.Totales_pagados.total_pagar) {
      this.Totales_pagados.vuelto = 0;
    } else {
      this.Totales_pagados.vuelto = this.Totales.total - this.Totales_pagados.total_pagar;
    }
    this.ListaMetodosPago.splice(indice, 1);
    this.search_input_pago?.nativeElement.focus();

  }

  CacularTotales() {
    let total = 0;
    let igv = 0;
    let subtotal = 0;
    this.ProductoSeleccionados.forEach((element: any) => {
      total += element.precio_venta_producto;
    });
    subtotal = total / (1 + 0.18);
    igv = total - subtotal;
    this.Totales.igv = igv.toFixed(2);
    this.Totales.subtotal = subtotal.toFixed(2);
    this.Totales.total = total.toFixed(2);
    this.Totales_pagados.total_pagar = this.Totales.total;
    if (this.Totales_pagados.total_pagado >= this.Totales_pagados.total_pagar) {
      this.MontoPagarCliente = 0;
    } else {
      this.MontoPagarCliente = this.Totales_pagados.total_pagar - this.Totales_pagados.total_pagado;
    }

    this.Totales_pagados.vuelto = this.Totales_pagados.total_pagado - this.Totales.total;
    this.MontoPagarCliente = this.Totales.total - this.Totales_pagados.total_pagado;
    this.MontoPagarCliente = Number(this.MontoPagarCliente.toFixed(2));
    if (this.Totales_pagados.vuelto < 0) {
      this.Totales_pagados.vuelto = 0;
    }
    if (this.MontoPagarCliente < 0) {
      this.MontoPagarCliente = 0;
    }
  }


  EnviarPagoVenta() {
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

  ClienteNuevo() {
    this.nota_venta.TraerDepartamento(this.token).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.departamentos = resp;
        $("#ajax-cliente-modal").modal('show');
      }, error: error => {
        this.departamentos = [];
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `Error con el departamento.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
        });
      }
    });
  }
  AsignarCliente() {
    this.nota_venta.AsignarCliente(this.token).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        $("#nombre_cliente").html(`<option value='${resp.id_cliente}'>${resp.nombre_cliente} (${resp.dni_cliente})</option>`)
      },
      error: error => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `No existe el cliente generico.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
        });
      }
    });
  }
  SeleccionarDepartamento() {
    this.nota_venta.TraerProvincia(this.token, this.informacionFormCliente.value.departamento).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.provincias = resp;
      }, error: error => {
        this.departamentos = [];
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `Error con el departamento.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
        });
      }
    });

  }
  SeleccionarProvincia() {
    this.nota_venta.TraerDistrito(this.token, this.informacionFormCliente.value.provincia).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.distritos = resp;
      }, error: error => {
        this.departamentos = [];
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `Error con el distrito.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
        });
      }
    });
  }
  MedioPagoSeleccionado() {
    this.search_input_pago?.nativeElement.focus();
  }
  CambioInput($evento: any) {
    switch ($evento.target.value) {
      case 'RUC':
        this.ruc_cliente = false;
        this.dni_cliente = true;
        break;
      case 'DNI/PASAPORTE':
        this.ruc_cliente = true;
        this.dni_cliente = false;
        break;

    }
  }
  EncontrarDatos(evento: any, Documento: string) {
    let numero_documento = evento.target.value;
    console.log(evento.keyCode);
    if (evento.keyCode == 13) {
      this.BuscarDocumentoLoading = true;
      if (Documento == "RUC") {
        if (numero_documento.length > 12) {
          evento.target.value = numero_documento.slice(0, 12);
        }
        this.nota_venta.BuscarRuc(evento.target.value).pipe(takeUntil(this.unsubscribe$)).subscribe({
          next: (resp) => {
            if (resp.success == false) {
              Swal.fire({
                toast: true,
                position: 'top',
                icon: 'error',
                title: `Error el Ruc no existe Verificar.`,
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 3000,
              });
            } else {
              this.informacionFormCliente.get('ruc_cliente')?.setValue(resp.ruc);
              this.informacionFormCliente.get('nombre_razon_social')?.setValue(resp.razonSocial);
              this.informacionFormCliente.get('estado')?.setValue(resp.estado);
              this.informacionFormCliente.get('condicion')?.setValue(resp.condicion);
              this.informacionFormCliente.get('direccion_cliente')?.setValue(resp.direccion);
              Swal.fire({
                toast: true,
                position: 'top',
                icon: 'success',
                title: `Ruc Encontrado.`,
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 3000,
              });
            }
            this.BuscarDocumentoLoading = false;
          }, error: error => {
            Swal.fire({
              toast: true,
              position: 'top',
              icon: 'error',
              title: `Error el Ruc no existe Verificar.`,
              showConfirmButton: false,
              timerProgressBar: true,
              timer: 3000,
            });
            this.BuscarDocumentoLoading = false;
          }
        })
      } else {
        if (numero_documento.length > 8) {
          evento.target.value = numero_documento.slice(0, 8);
        }
        this.nota_venta.BuscarDni(evento.target.value).pipe(takeUntil(this.unsubscribe$)).subscribe({
          next: resp => {
            if (resp.success == false) {
              Swal.fire({
                toast: true,
                position: 'top',
                icon: 'error',
                title: `Error el Dni no existe Verificar.`,
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 3000,
              });
            } else {
              this.informacionFormCliente.get('dni_cliente')?.setValue(resp.dni);
              this.informacionFormCliente.get('apellido_paterno')?.setValue(resp.apellidoPaterno);
              this.informacionFormCliente.get('apellido_materno')?.setValue(resp.apellidoMaterno);
              this.informacionFormCliente.get('nombre_razon_social')?.setValue(resp.nombres);
              this.informacionFormCliente.get('dv_cliente')?.setValue(resp.codVerifica);
              Swal.fire({
                toast: true,
                position: 'top',
                icon: 'success',
                title: `Dni Encontrado.`,
                showConfirmButton: false,
                timerProgressBar: true,
                timer: 3000,
              });
            }
            this.BuscarDocumentoLoading = false;
          }, error: error => {
            Swal.fire({
              toast: true,
              position: 'top',
              icon: 'error',
              title: `Error el Dni no existe Verificar.`,
              showConfirmButton: false,
              timerProgressBar: true,
              timer: 3000,
            });
            this.BuscarDocumentoLoading = false;

          }
        })
      }
    }

  }

  BuscarDocumento() {
    this.BuscarDocumentoLoading = true;
    let evento: any;
    if (this.informacionFormCliente.value.tipoDocumento == "RUC") {
      evento = {
        keyCode: 13,
        target: {
          value: this.informacionFormCliente.value.ruc_cliente
        }
      }
    } else {
      evento = {
        keyCode: 13,
        target: {
          value: this.informacionFormCliente.value.dni_cliente
        }
      }
    }
    this.EncontrarDatos(evento, this.informacionFormCliente.value.tipoDocumento);
  }

  GuardarCliente() {
    //
    this.informacionFormCliente.markAllAsTouched()
    if (this.informacionFormCliente.invalid) {
      console.log(this.informacionFormCliente)
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: 'Completar los campos obligatorios.',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      return;
    }

    this.nota_venta.GuardarCliente(this.token, this.informacionFormCliente.value).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.informacionFormCliente.reset();
        this.informacionFormCliente.get('departamento')?.setValue('');
        this.informacionFormCliente.get('distrito')?.setValue('');
        this.informacionFormCliente.get('provincia')?.setValue('');
        this.informacionFormCliente.get('tipoDocumento')?.setValue('RUC');
        this.ruc_cliente = false;
        this.dni_cliente = true;
        let documento = '';
        if (resp.dni_cliente) {
          documento = `(${resp.dni_cliente}-${resp.dv_cliente})`;
        } else {
          documento = `(${resp.ruc_cliente})`;
        }
        $("#nombre_cliente").html(`<option value='${resp.id_cliente}'>${resp.nombre_cliente} ${documento}</option>`)
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: 'Registrado con exito.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
        $("#ajax-cliente-modal").modal('hide');

      }, error: error => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'Ya existe el cliente Registrado.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }
    })
  }


  VerificarEmail($vento: any) {

  }
  ClienteActualizar() {

  }

  ConfirmarPagoNotaVenta() {
    this.informacionForm.get('cliente')?.setValue($("#nombre_cliente").val());
    let datos = {
      informacionForm: this.informacionForm.value,
      ProductoSeleccionados: this.ProductoSeleccionados,
      ListaMetodosPago: this.ListaMetodosPago,
      Totales: this.Totales,
      Totales_pagados: this.Totales_pagados,
      id_caja: this.id_caja
    };
    Swal.fire({
      title: 'Comprobante',
      html: 'Generando Comprobante del Cliente...',
      text: 'Generando Comprobante del Cliente...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        Swal.showLoading();
        this.nota_venta.GenerarNegocio(this.token, datos).pipe(takeUntil(this.unsubscribe$)).subscribe({
          next: respuesta => {
            var htmlticket = `<embed src="${respuesta.ticket}" frameborder="0" width="100%" height="400px">`;
            $("#viewjs2_negocio").html(htmlticket);
            var htmlpdf = `<embed src="${respuesta.pdf}" frameborder="0" width="100%" height="400px">`;
            $("#viewjs_negocio").html(htmlpdf);
            $(".imprimirTicket").addClass('active');
            $(".imprimirTicketcontent").addClass('active');
            $('#ajax-mostrar-pdf').modal('show');
            this.LimpiarInformacion();
            this.VolverPagina();

            this.informacionForm.get('tipo_documento')?.setValue('NOTA_VENTA');
            this.informacionForm.get('vendedor')?.setValue(this.identificacion.sub);
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
    this.ListaMetodosPago = [];
    this.informacionForm.reset();
    this.Totales_pagados.total_pagado = 0;
    this.Totales_pagados.total_pagar = 0;
    this.Totales_pagados.vuelto = 0;
    this.Totales.igv = 0;
    this.Totales.subtotal = 0;
    this.Totales.total = 0;
    this.AsignarCliente();
    this.informacionForm.get('vendedor')?.setValue(this.identificacion.sub);
    this.informacionForm.get('tipo_documento')?.setValue('NOTA_VENTA');
    this.VolverPagina();
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