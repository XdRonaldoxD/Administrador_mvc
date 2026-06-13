import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';
import { mustMatchValidator } from 'src/app/functions/validators/must-match';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { LoginService } from 'src/app/services/login.service';
import { StaffService } from 'src/app/services/staff.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})

export class UsuarioComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild("foto") foto?: ElementRef;
  @ViewChild("foto_mobile") foto_mobile?: ElementRef;
  @ViewChildren(DataTableDirective) dtElements!: QueryList<DataTableDirective>;
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  listarUsuario: any = [];
  listarUsuarioDeshabilitado: any = [];
  userForm!: FormGroup;
  password!: FormGroup;
  texto_cabezera: any = 'Nuevo Usuario';
  Unsuscribe: any = new Subject();
  api_url: string = environment.api_url;
  perfiles: any = [];
  sucursal: any = [];
  bodega: any = [];
  bodega_filtrar: any = [];
  
  passwordactive: boolean = true;
  GuardarInformacion: boolean = false;
  // [UI] La tabla de "Deshabilitado" se carga solo al abrir su pestaña, para evitar
  // una segunda llamada a listUserActive en la carga inicial.
  deshabilitadoCargado: boolean = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private Staff: StaffService,
    private servicio_login: LoginService
  ) {
    this.userForm = this.fb.group({
      id_usuario: [null],
      id_perfil: ['',[Validators.required]],
      id_staff: [''],
      dni_staff: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      nombre_staff: ['', [Validators.required]],
      apellidopaterno_staff: ['', [Validators.required]],
      apellidomaterno_staff: ['', [Validators.required]],
      e_mail_staff: ['', [Validators.email], this.CorreoEdicionUsuarioEnUso.bind(this)],
      telefono_staff: [''],
      celular_staff: [''],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      sexo_staff: ['',[Validators.required]],
      id_sucursal: ['',[Validators.required]],
      id_bodega: ['',[Validators.required]],
    },
      {
        validators: [
          mustMatchValidator('newPassword', 'confirmPassword'),
        ],
      });

      this.password = this.fb.group({
        id_usuario: [null],
        newPassword: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]]
      },
        {
          validators: [
            mustMatchValidator('newPassword', 'confirmPassword'),
          ],
        });
  }


  CorreoEdicionUsuarioEnUso(control: AbstractControl): Promise<any> | Observable<any> {
    const response = new Promise((resolve, reject) => {
      this.Staff
        .CorreoEdicionUsuarioEnUso(this.userForm.value.id_staff, control.value)
        .pipe(takeUntil(this.Unsuscribe))
        .subscribe({
          next: (resp) => {
            if (resp) {
              resolve({ correoEnUso: true });
            } else {
              resolve(null);
            }
          },
          error: () => {
            resolve({ correoEnUso: true });
          },
        });
    });
    return response;
  }

  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.token = this.servicio_login.getToken();
    this.SliderHabilitados();
    this.SliderDeshabilitados();
    this.Staff.mostrarDatosUsuario().pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
        this.perfiles = resp.perfiles;
        this.sucursal = resp.sucursal;
        this.bodega = resp.bodegas;
      }, error: error => {
        this.toastr.error(`${error}`, 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
      }
    })
  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_producto
  //SOLO LLAMAR LA FUNCION => this.reload_producto.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)

    this.reload_producto.unsubscribe();
    this.Unsuscribe.unsubscribe();
    this.reload_producto_deshabilitado.unsubscribe();
    this.passwordactive = true;

  }
  ngAfterViewInit(): void {
    this.reload_producto.next();
    // La tabla de deshabilitados solo se refresca aquí si ya fue abierta antes.
    if (this.deshabilitadoCargado) {
      this.reload_producto_deshabilitado.next();
    }
  }

  // [UI] Carga diferida de la tabla "Deshabilitado": se dispara una sola vez,
  // al hacer click en su pestaña (no en la carga inicial de la pantalla).
  cargarDeshabilitados(): void {
    if (!this.deshabilitadoCargado) {
      this.deshabilitadoCargado = true;
      this.reload_producto_deshabilitado.next();
    }
  }
  //FIN

  // [UI] Recarga la tabla activa MANTENIENDO la página actual (ajax.reload(null, false)),
  // para que tras guardar/editar/cambiar estado no salte a la página 1.
  private recargarTablaActiva(): void {
    // Recarga las tablas de listado (activa + deshabilitado) MANTENIENDO su página
    // (ajax.reload(null, false)). slice(0,2) excluye la tabla de historial (índice 2+).
    const tablas = this.dtElements ? this.dtElements.toArray().slice(0, 2) : [];
    if (tablas.length) {
      tablas.forEach((el: any) =>
        el.dtInstance
          .then((dtInstance: any) => dtInstance.ajax.reload(null, false))
          .catch(() => {})
      );
    } else {
      this.reload_producto.next();
    }
  }

  SliderHabilitados() {
    this.dtOptions[0] = this.createDtOptions(1);
  }

  SliderDeshabilitados() {
    this.dtOptions[1] = this.createDtOptions(0);
  }

  createDtOptions(vigente_usuario: number): any {
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
        dataTablesParameters.vigente_usuario = vigente_usuario;
        this.http.post<DataTablesResponse>(
          environment.api_url + "&controller=Staff&action=listUserActive",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          if (vigente_usuario === 1) {
            this.listarUsuario = resp.data;
          } else {
            this.listarUsuarioDeshabilitado = resp.data;
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
          width: "10%"
        },
        {
          width: "20%"
        },
        {
          width: "20%"
        },
      ],
    };
  }

  AbrirModal() {
    this.userForm.reset();
    this.userForm.get('id_perfil')?.setValue('');
    this.userForm.get('sexo_staff')?.setValue('');
    this.userForm.get('newPassword')?.setValidators([Validators.required]);
    this.userForm.get('newPassword')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    this.userForm.get('id_sucursal')?.setValue('');
    this.userForm.get('id_bodega')?.setValue('');
    this.bodega_filtrar = [];
    // [UI] Al crear: si hay UNA sola sucursal, preseleccionarla (y su bodega si es
    // única). Si hay más de una, queda vacío hasta que el usuario elija.
    if (this.sucursal && this.sucursal.length === 1) {
      this.userForm.get('id_sucursal')?.setValue(this.sucursal[0].id_sucursal);
      this.Seleccionar('Sucursal');
    }
    this.passwordactive = true;
    this.texto_cabezera = 'Usuario Nuevo';
    $('#exampleModalCenter').modal('show');
  }

  GuardarActualizaruser() {
    this.userForm.markAllAsTouched()
    if (this.userForm.invalid) {
      return;
    }
    this.GuardarInformacion = true;
    this.Staff.GestionarStaff(this.userForm.value).pipe(takeUntil(this.Unsuscribe),
      finalize(() => {
        // Resetear el flag PRIMERO: garantiza que el botón nunca quede pegado en
        // "Guardando..." aunque la recarga de la tabla falle.
        this.GuardarInformacion = false;
        $('#exampleModalCenter').modal('hide');
        try { this.recargarTablaActiva(); } catch (e) { }
      })).subscribe({
        next: resp => {
          this.servicio_login.saveIdentityPartial('id_bodega',this.userForm.value.id_bodega)
          this.toastr.success(`Staf ${resp} Exitosamente`, 'Realizado', {
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

  EditarUsuario(item: any) {
    this.userForm.reset();
    this.userForm.get('newPassword')?.clearValidators();
    this.userForm.get('newPassword')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    this.passwordactive = false;
    this.userForm.patchValue({
      id_usuario: item.id_usuario,
      id_perfil: item.id_perfil ?? '',
      id_staff: item.id_staff,
      dni_staff: item.dni_staff,
      nombre_staff: item.nombre_staff,
      apellidopaterno_staff: item.apellidopaterno_staff,
      apellidomaterno_staff: item.apellidomaterno_staff,
      telefono_staff: item.telefono_staff,
      celular_staff: item.celular_staff,
      sexo_staff: item.sexo_staff,
      id_sucursal: item.id_sucursal,
      id_bodega: item.id_bodega
    });
    this.Seleccionar('Sucursal');
    this.userForm.get('e_mail_staff')?.setValue(item.e_mail_staff);
    this.texto_cabezera = 'Editar Usuario';
    $('#exampleModalCenter').modal('show');
  }

  EstadoUser(accion: string, id_usuario: number) {
    let texto = '';
    if (accion == 'ACTIVAR') {
      texto = "activar";
    } else {
      texto = "deshabilitar";
    }
    Swal.fire({
      title: `¿Estas seguro de ${texto} el usuario?`,
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.Staff.GestionActivoDesactivadoStaff(id_usuario, accion).pipe(finalize(() => {
          this.recargarTablaActiva();
          this.reload_producto_deshabilitado.next();
        })).subscribe({
          next: (res) => {
            Swal.fire(
              'Listo!',
              `Slider ${texto} con Exito.`,
              'success'
            )
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              `Verificar Slider.`,
              'error'
            )
          }
        })
      }
    })
  }

  OpenChangePassword(id_usuario:any) {
    this.password.reset();
    this.password.get('id_usuario')?.setValue(id_usuario);
    $('#exampleModalPassword').modal('show');
  }


  ActualizarPass() {
    this.password.markAllAsTouched()
    if (this.password.invalid) {
      return;
    }
    this.GuardarInformacion = true;
    this.Staff.ActualizarPass(this.password.value).pipe(takeUntil(this.Unsuscribe),
      finalize(() => {
        $('#exampleModalPassword').modal('hide');
        this.GuardarInformacion = false;
      })).subscribe({
        next: resp => {
          this.toastr.success(`Contraseña actualizado Exitosamente`, 'Realizado', {
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

  Seleccionar(tipo: string) {
    switch (tipo) {
      case 'Sucursal':
        let id_sucursal = this.userForm.value.id_sucursal;
        this.bodega_filtrar = this.bodega.filter((item: any) => item.id_sucursal == id_sucursal);
        // [UI] Si la bodega actual ya no pertenece a la sucursal seleccionada (al crear
        // o al cambiar de sucursal): preseleccionar si hay UNA sola bodega, o dejar
        // vacío si hay más de una para que el usuario elija. En edición no se toca
        // porque la bodega cargada sí pertenece a su sucursal.
        const bodegaActual = this.userForm.value.id_bodega;
        const siguePerteneciendo = this.bodega_filtrar.some((b: any) => b.id_bodega == bodegaActual);
        if (!siguePerteneciendo) {
          this.userForm.get('id_bodega')?.setValue(
            this.bodega_filtrar.length === 1 ? this.bodega_filtrar[0].id_bodega : ''
          );
        }
        break;
    }
  }

  


}
