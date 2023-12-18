import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MarcaService } from '../../services/marca.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ModalMarcaComponent } from '../modals/modal-marca/modal-marca.component';


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
  @ViewChild('hijomodalmarca') hijomodalmarca: ModalMarcaComponent | any;

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

  BotonGuardarMarca: boolean = false;
  Unsuscribe: any = new Subject();

  constructor(private http: HttpClient,
    private servicio_marca: MarcaService,
    private servicio_login: LoginService,
  ) {

  }
  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
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
    let datos={
      accion:'CREAR',
      modulo:'MARCA'
    }
    this.hijomodalmarca.llamarFuncionHijoDesdePadre(datos);
    this.texto_cabezera="CREAR MARCA";
    $('#exampleModalCenter').modal('show');
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
    let datos={
      accion:'ACTUALIZAR',
      modulo:'MARCA',
      id_marca:item.id_marca,
      glosa_marca:item.glosa_marca,
    }
    this.hijomodalmarca.llamarFuncionHijoDesdePadre(datos);
    this.texto_cabezera = 'EDITAR MARCA';
    $('#exampleModalCenter').modal('show');
  }

  manejarRespuesta(respuesta: any) {
    console.log(respuesta);
    this.reload_producto.next();
    this.reload_producto_deshabilitado.next();
  }

}
