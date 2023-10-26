import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MarcaService } from '../../services/marca.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';


declare var $: any;
declare var Swal: any;
class DataTablesResponse {
  data: any[] | undefined;
  draw: number | undefined;
  recordsFiltered: number | undefined;
  recordsTotal: number | undefined;
}

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent implements AfterViewInit, OnDestroy, OnInit {
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  listarProducto: any = [];
  listarProductoDeshabilitado: any = [];
  marcarForm!: FormGroup;
  texto_cabezera: any;
  accion: string='';
  BotonGuardarMarca: boolean = false;
  Unsuscribe: any = new Subject();
  CantidadGuardar: number = 0;
  constructor(private http: HttpClient,
    private servicio_marca: MarcaService,
    private fb: FormBuilder,
    private servicio_login: LoginService,
    private toastr: ToastrService

  ) {
    this.marcarForm = this.fb.group({
      id_marca: [''],
      glosa_marca: ['', [Validators.required]],
      accion: ['CREAR'],
    });
  }
  ngOnInit(): void {
    this.token = this.servicio_login.getToken();
    this.ProductoHabilitados();
    this.ProductosDeshabilitados();
  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_producto
  //SOLO LLAMAR LA FUNCION => this.reload_producto.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)
    this.Unsuscribe.next();
    this.Unsuscribe.complete();
  }
  ngAfterViewInit(): void {
    this.reload_producto.next();
    this.reload_producto_deshabilitado.next();
  }
  //FIN


  ProductoHabilitados() {
    let headers = new HttpHeaders()
      .set('Authorization', this.token);
    this.dtOptions[0] = {
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
        dataTablesParameters.usuario_id = "Prueba";
        this.http.post<DataTablesResponse>(
          environment.api_url + "?controller=Marca&action=ListarMarca",
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
          width: "50%"
        },
        {
          width: "50%"
        },
      ],
    };
  }

  ProductosDeshabilitados() {
    let headers = new HttpHeaders()
      .set('Authorization', this.token);
    this.dtOptions[1] = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      destroy: true,
      order: [],
      ordering: false,
      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.usuario_id = "Prueba";
        this.http.post<DataTablesResponse>(
          environment.api_url + "?controller=Marca&action=listarMarcaDesactivados",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          this.listarProductoDeshabilitado = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: [],
          });
        });
      },
      columns: [
        {
          width: "50%"
        },
        {
          width: "50%"
        },
      ],
    };
  }

  AbrirModal() {
    // this.marcarForm.reset();
    // this.marcarForm.get('accion')!.setValue('CREAR');
    this.accion = 'CREAR';
    this.texto_cabezera = 'Nuevo Marca';
    $('#exampleModalCenter').modal('show');
  }

  GuardarActualizarCategoria() {
    this.CantidadGuardar++;
    this.marcarForm.markAllAsTouched()
    if (this.marcarForm.invalid) {
      return;
    }


    if (this.CantidadGuardar === 1) {
      this.servicio_marca.GestionarMarca(this.marcarForm.value).pipe(
        takeUntil(this.Unsuscribe)
        , finalize(() => {
          this.CantidadGuardar=0;
          this.reload_producto.next();
          $('#exampleModalCenter').modal('hide');
        })).subscribe({
          next: (res) => {
            this.toastr.success(`Marca ${res} con exito`, undefined, {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          },
          error: (error) => {

          }
        })
    }

  }

  EstadoMarca(estado: any, id_marca: any) {
    this.servicio_marca.Habilitar_Deshabilitar_Marca(this.token, id_marca, estado).pipe(takeUntil(this.Unsuscribe),finalize(()=>{
      this.reload_producto.next();
      this.reload_producto_deshabilitado.next();
    })).subscribe({
      next: resp => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: `Marca ${resp} con exito`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }, error: error => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `Marca ${error}`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }
    });
  }
  EditarMarca(item: any) {
    this.marcarForm.get('accion')!.setValue('ACTUALIZAR');
    this.marcarForm.get('id_marca')!.setValue(item.id_marca);
    this.marcarForm.get('glosa_marca')!.setValue(item.glosa_marca);
    this.texto_cabezera = 'Editar Marca';
    $('#exampleModalCenter').modal('show');
  }

  manejarRespuesta(respuesta: any) {
    console.log(respuesta);
    this.reload_producto.next();
  }

}
