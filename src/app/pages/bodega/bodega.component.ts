import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { LoginService } from 'src/app/services/login.service';
import { MarcaService } from 'src/app/services/marca.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ModalMarcaComponent } from '../modals/modal-marca/modal-marca.component';
import { BodegaService } from 'src/app/services/bodega.service';
import { ModalBodegaComponent } from '../modals/modal-bodega/modal-bodega.component';

declare var $: any;
@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.component.html',
  styleUrls: ['./bodega.component.css']
})
export class BodegaComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('hijomodalbodega') hijomodalbodega: ModalBodegaComponent | any;

  dtOptions: DataTables.Settings[] = [];
  reload_bodega: any = new Subject();
  reload_bodega_deshabilitado: any = new Subject();
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
    private servicio_bodega: BodegaService,
    private servicio_login: LoginService
  ) {

  }
  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.token = this.servicio_login.getToken();
    this.listarBodegas();
    this.listarBodegasDeshabilitado();
  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_bodega
  //SOLO LLAMAR LA FUNCION => this.reload_bodega.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)
    this.Unsuscribe.next();
    this.Unsuscribe.complete();
  }
  ngAfterViewInit(): void {
    this.reload_bodega.next();
    this.reload_bodega_deshabilitado.next();
  }
  //FIN
  listarBodegas() {
    this.dtOptions[0] = this.createDtOptions(1);
  }

  listarBodegasDeshabilitado() {
    this.dtOptions[1] = this.createDtOptions(0);
  }


  createDtOptions(vigente_bodega: number) {
    let headers = new HttpHeaders()
      .set('Authorization', this.token);
    return  {
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
      ajax: (dataTablesParameters: any, callback:any) => {
        dataTablesParameters.vigente_bodega = vigente_bodega;
        this.http.post<DataTablesResponse>(
          environment.api_url + "&controller=Bodega&action=listarBodegas",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          if (vigente_bodega==1) {
            this.listarProducto = resp.data;
          }else{
            this.listarProductoDeshabilitado = resp.data;
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
          width: "50%"
        },
        {
          width: "50%"
        }
      ],
    };
  }

  EstadoBodega(accion: string, id_bodega: number) {
    let texto = '';
    if (accion == 'ACTIVAR') {
      texto = "activar";
    } else {
      texto = "deshabilitar";
    }
    Swal.fire({
      title: `¿Estas seguro de ${texto} la bodega?`,
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.servicio_bodega.gestionarestadoBodega(id_bodega, accion).pipe(finalize(() => {
          this.reload_bodega.next();
          this.reload_bodega_deshabilitado.next();
        })).subscribe({
          next: (res) => {
            Swal.fire(
              'Listo!',
              `Bodega ${texto} con Exito.`,
              'success'
            )
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              `Bodega.`,
              'error'
            )
          }
        })
      }
    })
  }

  AbrirModal() {
    let datos={
      accion:'CREAR'
    }
    this.hijomodalbodega.llamarFuncionHijoDesdePadre(datos);
    this.texto_cabezera="CREAR BODEGA";
    $('#exampleModalBodegaCenter').modal('show');
  }
  EditarBodega(item: any) {
    let datos={
      accion:'ACTUALIZAR',
      id_bodega:item.id_bodega,
      glosa_bodega:item.glosa_bodega,
    }
    this.hijomodalbodega.llamarFuncionHijoDesdePadre(datos);
    this.texto_cabezera = 'EDITAR BODEGA';
    $('#exampleModalBodegaCenter').modal('show');
  }
  manejarRespuesta(respuesta: any) {
    this.reload_bodega.next();
    this.reload_bodega_deshabilitado.next();
  }

}
