import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { LoginService } from 'src/app/services/login.service';
import { NotaVenta } from 'src/app/services/notaventa.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ModalBodegaComponent } from '../modals/modal-bodega/modal-bodega.component';
declare var $: any;
@Component({
  selector: 'app-sucursal',
  templateUrl: './sucursal.component.html',
  styleUrls: ['./sucursal.component.css']
})
export class SucursalComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild("foto") foto?: ElementRef;
  @ViewChild("foto_mobile") foto_mobile?: ElementRef;
  @ViewChild('hijomodalbodega') hijomodalbodega: ModalBodegaComponent | any;
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  listarSucursal: any = [];
  listarSucursalDeshabilitado: any = [];
  sucursalForm!: FormGroup;
  password!: FormGroup;
  texto_cabezera_sucursal: any = 'Nueva Sucursal';
  texto_cabezera: any = 'Nueva Bodega';
  Unsuscribe: any = new Subject();
  api_url: string = environment.api_url;
  perfiles: any = [];
  GuardarInformacion: boolean = false;
  departamentos: any = [];
  distritos: any = [];
  provincias: any = [];
  bodegas: any = [];
  filtrar_distrito: any = [];
  filtrar_provincia: any = [];
  clientes: any[] = [];
  isLoading: boolean = false;
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private Sucursal: SucursalService,
    private servicio_login: LoginService,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((res: any) => {
      this.departamentos = Object.values(res.datos.departamentos);
      this.distritos = Object.values(res.datos.distrito);
      this.provincias = Object.values(res.datos.provincia);
      this.bodegas = Object.values(res.datos.bodegas);

    })
    this.sucursalForm = this.fb.group({
      id_sucursal: [''],
      codigo_sucursal: [''],
      idDepartamento: ['', [Validators.required]],
      idProvincia: ['', [Validators.required]],
      idDistrito: ['', [Validators.required]],
      glosa_sucursal: ['', [Validators.required]],
      encargado_sucursal: [''],
      direccion_sucursal: [''],
      telefono_sucursal: [''],
      e_mail_sucursal: ['', [Validators.email]],
      mapa_sucursal: [''],
      descripcion_sucursal: [''],
      idclientedefectopos_sucursal: ['', [Validators.required]],
      mediopagodefectopos_sucursal: [''],
      idusuarioventaonlinedefecto_sucursal: [''],
      id_bodega: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.token = this.servicio_login.getToken();
    this.SucursalHabilitados();
    this.SucursalDeshabilitados();
  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_producto
  //SOLO LLAMAR LA FUNCION => this.reload_producto.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)

    this.reload_producto.unsubscribe();
    this.Unsuscribe.unsubscribe();
    this.reload_producto_deshabilitado.unsubscribe();

  }
  ngAfterViewInit(): void {
    this.reload_producto.next();
    this.reload_producto_deshabilitado.next();
  }
  //FIN
  buscarCliente(term: string) {
    this.isLoading = true;
    if (term.length > 1) {
      this.Sucursal.buscarClienteDefecto(term).pipe(takeUntil(this.Unsuscribe))
        .subscribe((data: any) => {
          this.clientes = data.map((item: any) => item);
          this.isLoading = false;
        });
    } else {
      this.limpiarSeleccion();
      this.isLoading = false;
    }
  }
  limpiarSeleccion() {
    this.clientes = [];
  }

  SucursalHabilitados() {
    this.dtOptions[0] = this.createDtOptions(1);
  }

  SucursalDeshabilitados() {
    this.dtOptions[1] = this.createDtOptions(0);
  }
  Seleccionar(tipo: string) {
    switch (tipo) {
      case 'Departamento':
        let idDepartamento = this.sucursalForm.value.idDepartamento;
        this.filtrar_provincia = this.provincias.filter((item: any) => item.idDepartamento === idDepartamento)
        break;
      case 'Provincia':
        let idProvincia = this.sucursalForm.value.idProvincia;
        this.filtrar_distrito = this.distritos.filter((item: any) => item.idProvincia === idProvincia)
        break;
    }
  }

  createDtOptions(vigente_sucursal: number): any {
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
        dataTablesParameters.vigente_sucursal = vigente_sucursal;
        this.http.post<DataTablesResponse>(
          environment.api_url + "?controller=Sucursal&action=listaSucursal",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          if (vigente_sucursal === 1) {
            this.listarSucursal = resp.data;
          } else {
            this.listarSucursalDeshabilitado = resp.data;
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
          width: "30%"
        },
        {
          width: "20%"
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

  AbrirModal() {
    this.sucursalForm.reset({
      idDepartamento: '',
      idProvincia: '',
      idDistrito: '',
      id_bodega: ''
    });
    this.texto_cabezera_sucursal = 'NUEVO SUCURSAL';
    $('#exampleModalSucursal').modal('show');
  }

  GuardarActualizaruser() {
    this.sucursalForm.markAllAsTouched()
    if (this.sucursalForm.invalid) {
      this.toastr.error("Verificar Campos Obligatorio", 'Validar', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      return;
    }
    this.GuardarInformacion = true;
    this.Sucursal.gestionarSucursal(this.sucursalForm.value).pipe(takeUntil(this.Unsuscribe),
      finalize(() => {
        $('#exampleModalSucursal').modal('hide');
        this.ngAfterViewInit();
        this.GuardarInformacion = false;

      })).subscribe({
        next: resp => {
          this.toastr.success(resp, 'Realizado', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }, error: error => {
          this.toastr.error(`${error}`, 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      })

  }

  EditarSucursal(data: any) {
    this.sucursalForm.reset();
    this.Sucursal.traerSucursal(data.id_sucursal).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: (datos) => {
        let item = datos.sucursal;
        let id_bodegas = datos.sucursalbodega.map((bodega: any) => bodega.id_bodega);
        this.sucursalForm.patchValue({
          id_sucursal: item.id_sucursal,
          codigo_sucursal: item.codigo_sucursal,
          idDepartamento: item.idDepartamento,
          idProvincia: item.idProvincia,
          idDistrito: item.idDistrito,
          glosa_sucursal: item.glosa_sucursal,
          encargado_sucursal: item.encargado_sucursal,
          direccion_sucursal: item.direccion_sucursal,
          telefono_sucursal: item.telefono_sucursal,
          e_mail_sucursal: item.e_mail_sucursal,
          mapa_sucursal: item.mapa_sucursal,
          descripcion_sucursal: item.descripcion_sucursal,
          idclientedefectopos_sucursal: item.idclientedefectopos_sucursal,
          idusuarioventaonlinedefecto_sucursal: item.idusuarioventaonlinedefecto_sucursal,
          id_bodega: id_bodegas
        });
        this.Seleccionar('Departamento');
        this.Seleccionar('Provincia');
        //CLIENTE DEFECTO
        this.clientes = [{
          id_cliente: item.idclientedefectopos_sucursal,
          nombre_cliente: item.nombre_cliente,
        }]
        //
        this.texto_cabezera_sucursal = 'Editar Sucursal';
        $('#exampleModalSucursal').modal('show');
      },
      error: (error) => {
        this.toastr.error(`Ubo un errro al editar la sucursal`, 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      }
    })

  }

  EstadoSucursal(accion: string, id_sucursal: number) {
    let texto = '';
    let vigente_sucursal: number = 0;
    if (accion == 'ACTIVAR') {
      texto = "activar";
      vigente_sucursal = 1;
    } else {
      texto = "deshabilitar";
    }
    Swal.fire({
      title: `¿Estas seguro de ${texto} la sucursal ?`,
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.Sucursal.gestionarestadoSucursal(id_sucursal, vigente_sucursal).pipe(finalize(() => {
          this.ngAfterViewInit();
        })).subscribe({
          next: (res) => {
            Swal.fire(
              'Listo!',
              `Sucursal ${texto} con Exito.`,
              'success'
            )
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              `Verificar Sucursal.`,
              'error'
            )
          }
        })
      }
    })
  }

  manejarRespuestaBodega(respuesta: any) {
    console.log("HIJO RESPUESTA", respuesta) // Manejar la respuesta aquí
    this.bodegas.push(respuesta);
    let bodega_escogido = this.sucursalForm.value.id_bodega;
    if (bodega_escogido.length>0) {
      bodega_escogido.push(respuesta.id_bodega);
      this.sucursalForm.get('id_bodega')?.setValue(bodega_escogido);
    } else {
      this.sucursalForm.get('id_bodega')?.setValue([respuesta.id_bodega]);
    }
  }

  AbrirModalBodega() {
    let datos = {
      accion: 'CREAR',
      modulo: 'SUCURSAL',
    }
    this.hijomodalbodega.llamarFuncionHijoDesdePadre(datos);
    this.texto_cabezera = "CREAR BODEGA";
    $("#exampleModalSucursal").modal('hide');
    $('#exampleModalBodegaCenter').modal('show');
  }


}

