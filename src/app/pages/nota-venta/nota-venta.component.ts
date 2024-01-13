import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { separarNombresApellidos } from 'src/app/functions/validators/helper';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { Totales, Totales_pagados } from 'src/app/interface/Datos';
import { LoginService } from 'src/app/services/login.service';
import { NotaVenta } from 'src/app/services/notaventa.service';
import { environment } from 'src/environments/environment';
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
  @ViewChild('ruc_cliente_formulario') ruc_cliente_formulario: ElementRef | undefined;

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

  listaCliente: any[] = [];
  id_caja: any = null;
  id_departamento: any = ''
  id_provincia: any = '';
  id_distrito: any = '';
  id_negocio: any = null;
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
  Correo_pdf: string = '';
  Correo_ticket: string = '';
  url_pdf: string = '';
  url_ticket: string = '';
  busquedafactura: boolean = false;
  isLoading: boolean = false;
  contador_texto: any;
  constructor(
    private http: HttpClient,
    private servicio_login: LoginService,
    private nota_venta: NotaVenta,
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService
  ) {
    this.token = this.servicio_login.getToken();
    this.identificacion = this.servicio_login.getIdentity();

  }

  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.ProductoBuscar = this.fb.group({
      glosa_producto: ['']
    });
    this.informacionForm = this.fb.group({
      id_empresa: [this.identificacion.id_empresa],
      cliente: [null],
      vendedor: [this.identificacion.sub],
      tipo_documento: ['NOTA VENTA']
    });

    this.informacionFormCliente = this.fb.group({
      tipoDocumento: ['RUC'],
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

    this.Mostrar_Productos();
    this.Mostrar_Medio_Pago();
    this.AsignarCliente();
  }

  ngAfterViewInit(): void {

    this.search_input_producto?.nativeElement.focus();
    this.reload_producto.next();

    this.nota_venta.VerificarCajaAbierta(this.identificacion.sub).pipe(takeUntil(this.unsubscribe$)).subscribe({
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

  SearchCliente(term: string) {
    this.isLoading = true;
    if (term.length > 3) {
      this.nota_venta.FiltrarCliente(term, this.informacionForm.value.tipo_documento).pipe(takeUntil(this.unsubscribe$))
        .subscribe((data: any) => {
          this.listaCliente = data.map((item: any) => ({
            glosa_cliente: `${item.nombre_cliente} ${item.apellidopaterno_cliente ?? ''} ${item.apellidopaterno_cliente ?? ''} (${item.documento}) `,
            id_cliente: item.id_cliente,
          }));
          this.isLoading = false;
        });
    } else {
      this.limpiarSeleccion();
      this.isLoading = false;
    }
  }
  limpiarSeleccion() {
    this.listaCliente = [];

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
        dataTablesParameters.id_bodega=this.identificacion.id_bodega;
        if (this.ProductoBuscar.value.glosa_producto) {
          dataTablesParameters.filtro_buscar = this.ProductoBuscar.value.glosa_producto;
        }
        this.http.post<DataTablesResponse>(
          environment.api_url + "&controller=NotaVenta&action=ListaProductos",
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
    this.nota_venta.ListaMediosPagos().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.MedioPago = resp;
      },
      error: error => {
        this.toast.error(`Verificar los Pagos.`, 'Medio Pago');
        return;
      }
    })
  }

  BuscarProductos() {
    this.reload_producto.next();
  }

  EnviarProducto(datos: any) {
    let existeProducto = false;
    const tasaIVA = 18;
    this.ProductoSeleccionados.forEach((element: any) => {
      if (element.id_producto == datos.id_producto) {
        if ((parseInt(element.cantidad_seleccionado) + 1) > element.total_stock_producto_bodega) {
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
    if (cantidad > this.ProductoSeleccionados[indice].total_stock_producto_bodega) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: `No hay stock del producto`,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      e.target.parentElement.parentElement.firstElementChild.value = this.ProductoSeleccionados[indice].total_stock_producto_bodega;
      this.ProductoSeleccionados[indice].cantidad_seleccionado = this.ProductoSeleccionados[indice].total_stock_producto_bodega;

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
    } else if (cantidad > this.ProductoSeleccionados[indice].total_stock_producto_bodega) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: `No hay stock del producto`,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      e.target.value = this.ProductoSeleccionados[indice].total_stock_producto_bodega;
      this.ProductoSeleccionados[indice].cantidad_seleccionado = this.ProductoSeleccionados[indice].total_stock_producto_bodega;
    } else {
      this.ProductoSeleccionados[indice].cantidad_seleccionado = cantidad;
      e.target.value = cantidad;
    }
    this.ProductoSeleccionados[indice].precio_venta_producto = this.ProductoSeleccionados[indice].precioventa_producto * this.ProductoSeleccionados[indice].cantidad_seleccionado;
    this.CacularTotales();
  }
  EscribirProducto(e: any) {
    clearTimeout(this.contador_texto); // <--- The solution is here
    this.contador_texto = setTimeout(() => {
      this.BuscarProductos();
    }, 500);
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
    let totalexonerado = 0;
    let igv = 0;
    let subtotal = 0;
    this.ProductoSeleccionados.forEach((element: any) => {
      if (element.id_tipo_afectacion == 1) {
        total += element.precio_venta_producto;
      } else {
        totalexonerado += element.precio_venta_producto;
      }

    });
    if (total > 0) {
      subtotal = total / (1 + 0.18);
      igv = total - subtotal;
    }
    subtotal += totalexonerado;
    this.Totales.igv = igv.toFixed(2);
    this.Totales.subtotal = subtotal.toFixed(2);
    this.Totales.total = total + totalexonerado;
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

  ClienteNuevo() {
    this.nota_venta.TraerDepartamento().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.departamentos = resp;
        $("#ajax-cliente-modal").modal('show');
        setTimeout(() => {
          this.ruc_cliente_formulario?.nativeElement.focus();
        }, 200);

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
    if (this.busquedafactura) {
      this.toast.warning(`No se puede asignar un cliente cuando es una factura.`, 'Cliente', {
        timeOut: 3000,
      });
      return;
    }
    this.nota_venta.AsignarCliente().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: item => {
        this.listaCliente = [{
          glosa_cliente: `${item.nombre_cliente} ${item.apellidopaterno_cliente ?? ''} ${item.apellidopaterno_cliente ?? ''} (${item.dni_cliente}) `,
          id_cliente: item.id_cliente,
        }];
        this.informacionForm.get('cliente')?.setValue(item.id_cliente);
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
    this.nota_venta.TraerProvincia(this.informacionFormCliente.value.departamento).pipe(takeUntil(this.unsubscribe$)).subscribe({
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
    this.nota_venta.TraerDistrito(this.informacionFormCliente.value.provincia).pipe(takeUntil(this.unsubscribe$)).subscribe({
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
    const rucControl: any = this.informacionFormCliente.get('ruc_cliente');
    const dniControl: any = this.informacionFormCliente.get('dni_cliente');
    switch ($evento.target.value) {
      case 'RUC':
        rucControl.setValidators([Validators.required]);
        dniControl.clearValidators();
        this.ruc_cliente = false;
        this.dni_cliente = true;
        break;
      case 'DNI/PASAPORTE':
        rucControl.clearValidators();
        dniControl.setValidators([Validators.required]);
        this.ruc_cliente = true;
        this.dni_cliente = false;
        break;

    }
  }
  EncontrarDatos(evento: any, Documento: string) {
    let numero_documento = evento.target.value;
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
              const datapersonal = separarNombresApellidos(resp.razonSocial);
              this.informacionFormCliente.get('ruc_cliente')?.setValue(resp.ruc);
              this.informacionFormCliente.get('nombre_razon_social')?.setValue(datapersonal.nombres);
              this.informacionFormCliente.get('apellido_paterno')?.setValue(datapersonal.apellidoPaterno);
              this.informacionFormCliente.get('apellido_materno')?.setValue(datapersonal.apellidoMaterno);
              this.informacionFormCliente.get('estado')?.setValue(resp.estado);
              this.informacionFormCliente.get('condicion')?.setValue(resp.condicion);
              this.informacionFormCliente.get('direccion_cliente')?.setValue(resp.direccion);

              if (resp.departamento) {
                this.BuscarDepartamento(resp.departamento)
                this.BuscarProvincia(resp.provincia)
                this.BuscarDistrito(resp.distrito)
                setTimeout(() => {
                  this.informacionFormCliente.get('departamento')?.setValue(`${this.id_departamento}`);
                  const departamentoElement = document.getElementById('departamento');
                  if (departamentoElement) {
                    departamentoElement.dispatchEvent(new Event('change'));
                  }
                  this.informacionFormCliente.get('provincia')?.setValue(`${this.id_provincia}`);
                  const provincia = document.getElementById('provincia');
                  if (provincia) {
                    provincia.dispatchEvent(new Event('change'));
                  }
                  this.informacionFormCliente.get('distrito')?.setValue(`${this.id_distrito}`);
                }, 1000);
              } else {
                this.informacionFormCliente.get('departamento')?.setValue(``);
                this.informacionFormCliente.get('provincia')?.setValue(``);
                this.informacionFormCliente.get('distrito')?.setValue(``);

                const departamentoElement = document.getElementById('departamento');
                if (departamentoElement) {
                  departamentoElement.dispatchEvent(new Event('change'));
                }
                const provincia = document.getElementById('provincia');
                if (provincia) {
                  provincia.dispatchEvent(new Event('change'));
                }
              }
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
  actualizarFormulario(campo: string, valor: string) {
    const control = this.informacionFormCliente.get(campo);
    if (control) {
      control.setValue(valor);
      const elemento = document.getElementById(campo);
      if (elemento) {
        elemento.dispatchEvent(new Event('change'));
      }
    }
  }
  BuscarDepartamento(departamento: string) {
    this.nota_venta.BuscarDepartamento(departamento).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: res => {
        this.id_departamento = res
      },
      error: error => {
        this.toast.error(`No hay Departamento en base`, undefined, {
          timeOut: 3000,
        });
      }
    })
  }
  BuscarProvincia(provincia: string) {
    this.nota_venta.BuscarProvincia(provincia).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: res => {
        this.id_provincia = res
      },
      error: error => {
        this.toast.error(`No hay Provincia en base`, undefined, {
          timeOut: 3000,
        });
      }
    })
  }
  BuscarDistrito(distrito: string) {
    this.nota_venta.BuscarDistrito(distrito).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: res => {
        this.id_distrito = res
      },
      error: error => {
        this.toast.error(`No hay Distrito en base`, undefined, {
          timeOut: 3000,
        });
      }
    })
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

    this.nota_venta.GuardarCliente(this.informacionFormCliente.value).pipe(takeUntil(this.unsubscribe$)).subscribe({
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
        this.listaCliente = [{
          glosa_cliente: `${resp.nombre_cliente} ${resp.apellidopaterno_cliente ?? ''} ${resp.apellidopaterno_cliente ?? ''} (${documento}) `,
          id_cliente: resp.id_cliente,
        }];
        this.informacionForm.get('cliente')?.setValue(resp.id_cliente);
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

    if (this.ProductoSeleccionados.length == 0) {
      this.toast.error(`No hay productos`, undefined, {
        timeOut: 3000,
      });
      return;
    }
    if (this.ListaMetodosPago.length == 0) {
      this.toast.error(`No hay medios de pagos`, undefined, {
        timeOut: 3000,

      });
      return;
    }


    if (this.informacionForm.value.cliente === null) {
      this.toast.error(`No hay un cliente seleccionado`, undefined, {
        timeOut: 3000,
      });
      return;
    }
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
        this.nota_venta.GenerarNegocio(datos).pipe(takeUntil(this.unsubscribe$)).subscribe({
          next: respuesta => {
            this.url_pdf = respuesta.pdf;
            this.url_ticket = respuesta.ticket;
            var htmlpdf = `<iframe src="${respuesta.pdf}" frameborder="0" width="100%" height="400px"></iframe>`;
            $("#viewjs_negocio").html(htmlpdf);
            $(".imprimirTicket").addClass('active');
            $(".imprimirTicketcontent").addClass('active');
            $('#ajax-mostrar-pdf').modal('show');
            Swal.close();
          },
          error: error => {
            Swal.close();
            this.toast.error(`Verificar Stock Producto`, undefined, {
              timeOut: 3000,
            });
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
    this.busquedafactura = false;
    this.AsignarCliente();
    this.informacionForm.get('vendedor')?.setValue(this.identificacion.sub);
    this.informacionForm.get('id_empresa')?.setValue(this.identificacion.id_empresa);
    this.informacionForm.get('tipo_documento')?.setValue('NOTA VENTA');
    this.VolverPagina();
  }


  LimpiarModalNegocio() {
    $('#ajax-mostrar-pdf').modal('hide');
    $("#viewjs_negocio").html('');
    $(".imprimirTicket").removeClass('active');
    $(".imprimirTicketcontent").removeClass('active');
    $(".imprimirBoletaAfectaContent ").removeClass('active');
    $(".imprimirBoletaAfecta").removeClass('active');
    this.LimpiarInformacion();
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
      tipo_documento: this.informacionForm.value.tipo_documento
    }
    Swal.fire({
      title: 'Espere',
      html: 'Enviando email del Cliente...',
      text: 'Enviando email del Cliente...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onOpen: () => {
        Swal.showLoading();
        this.nota_venta.EnviarCorreloElectronicoEmail(datos).pipe(takeUntil(this.unsubscribe$)).subscribe({
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



  VerficarDocumentoCliente(evento: any) {
    this.limpiarSeleccion();
    switch (evento.value) {
      case 'FACTURA':
        this.informacionForm.get('cliente')?.setValue(null);
        this.busquedafactura = true;
        break;
      default:
        this.busquedafactura = false;
        this.AsignarCliente()
        break;
    }
  }

}
