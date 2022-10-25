import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, finalize } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MarcaService } from '../../services/marca.service';


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

  constructor(private http: HttpClient,
    private servicio_marca: MarcaService,
    private fb: FormBuilder,
    private servicio_login: LoginService,

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
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });



  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_producto
  //SOLO LLAMAR LA FUNCION => this.reload_producto.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)
    this.reload_producto.unsubscribe();
    this.reload_producto_deshabilitado.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.reload_producto.next();
    this.reload_producto_deshabilitado.next();
  }
  //FIN
  provando() {
    // this.reload_producto.next();
    this.reload_producto_deshabilitado.next();

  }

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

      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.usuario_id = "Prueba";
        this.http.post<DataTablesResponse>(
          "http://localhost/MVC_CRM/?controller=Marca&action=ListarMarca",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          this.listarProducto = resp;
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
      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.usuario_id = "Prueba";
        this.http.post<DataTablesResponse>(
          "http://localhost/MVC_CRM/?controller=Marca&action=ListarMarcaDesactivados",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          this.listarProductoDeshabilitado = resp;
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
    this.marcarForm.reset();
    this.marcarForm.get('accion')!.setValue('CREAR');
    $("#t-crear-categoria").html('');
    this.texto_cabezera = 'Nuevo Marca';
    $('#exampleModalCenter').modal('show');
  }

  GuardarActualizarCategoria() {
    this.marcarForm.markAllAsTouched()
    if (this.marcarForm.invalid) {
      return;
    }
    var checked: any = [];
    //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
    $("input[name='categoria_padre']:checked").each((i: any, elemento: any) => {
      //Mediante la función push agregamos al arreglo los values de los checkbox
      checked.push(($(elemento).attr("value")));
    });
    // Utilizamos console.log para ver comprobar que en realidad contiene algo el arreglo
    this.servicio_marca.GestionarMarca(this.token, this.marcarForm.value).pipe(finalize(() => {
      this.reload_producto.next();
      $('#exampleModalCenter').modal('hide');
    })).subscribe({
      next: (res) => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: `Marca ${res} con exito`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })

      },
      error: (error) => {

      }
    })
  }

}
