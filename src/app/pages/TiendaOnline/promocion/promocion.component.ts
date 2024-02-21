import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuillViewComponent } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { HelpersService } from 'src/app/services/helpers.service';
import { LoginService } from 'src/app/services/login.service';
import { PromocionService } from 'src/app/services/promocion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-promocion',
  templateUrl: './promocion.component.html',
  styleUrls: ['./promocion.component.css']
})
export class PromocionComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('descripcion_promocion') descripcion_promocion?: QuillViewComponent;
  @ViewChild("foto") foto?: ElementRef;
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  listarProducto: any = [];
  promocionForm!: FormGroup;
  texto_cabezera: string = '';
  Unsuscribe: any = new Subject();
  api_url: string = environment.api_url;
  environment: any;
  GuardarInformacion: boolean = false;
  modulesQuill: any;
  constructor(private http: HttpClient,
    private promocion: PromocionService,
    private fb: FormBuilder,
    private servicio_login: LoginService,
    private toastr: ToastrService,
    private Helper: HelpersService

  ) {
    this.modulesQuill = this.Helper.getToolbarConfig();
    this.promocionForm = this.fb.group({
      id_promocion: [],
      titulo_promocion: ['', [Validators.required]],
      fecha_promocion: ['', [Validators.required]],
      descripcion_promocion: ['', [Validators.required]],
      accion: ['CREAR'],
    });
  }
  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    // Translated
    $('.dropify').dropify({
      messages: {
        default: 'Agregar imagen para la tienda en linea',
        replace: 'Reemplazar  imagen para la tienda en linea',
        remove: 'Eliminar',
        error: 'Désolé, le fichier trop volumineux'
      }
    });
    this.token = this.servicio_login.getToken();
    this.SliderHabilitados();
  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_producto
  //SOLO LLAMAR LA FUNCION => this.reload_producto.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)
    this.reload_producto.unsubscribe();
    this.Unsuscribe.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.reload_producto.next();
  }
  //FIN
  SliderHabilitados() {
    this.dtOptions[0] = this.createDtOptions(1);
  }

  createDtOptions(vigente_slider: number): any {
    let headers = new HttpHeaders().set('Authorization', this.token);
    return {
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
      ajax: (dataTablesParameters: any, callback: any) => {
        dataTablesParameters.vigente_slider = vigente_slider;
        this.http.post<DataTablesResponse>(
          environment.api_url + "&controller=Promociones&action=listarPromociones",
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
          width: "20%"
        },
        {
          width: "30%"
        },
        {
          width: "30%"
        },
        {
          width: "20%"
        },
      ],
    };
  }

  AbrirModal() {
    $(".dropify-clear").click();
    this.promocionForm.reset();
    this.promocionForm.get('accion')!.setValue('CREAR');
    $("#t-crear-categoria").html('');
    this.texto_cabezera = 'NUEVO PROMOCION';
    this.limpiarEditorQuill();
    const fechaActual = new Date();    // Obtener la fecha actual
    const nuevaFecha = new Date();
    nuevaFecha.setMonth(fechaActual.getMonth() + 1);    // Sumar un mes a la fecha actual
    const nuevaFechaString = nuevaFecha.toISOString().split('T')[0];    // Formatear la nueva fecha como una cadena (puedes ajustar el formato según tus necesidades)
    this.promocionForm.get('fecha_promocion')!.setValue(nuevaFechaString);   // Establecer la nueva fecha en el formulario
    $('#exampleModalPromocion').modal('show');
  }

  GuardarActualizarCategoria() {
    this.promocionForm.markAllAsTouched()
    if (this.promocionForm.invalid) {
      return;
    }
    let file = null;
    const imagen_escritorio = this.foto?.nativeElement.files;
    if (imagen_escritorio.length > 0) {
      file = imagen_escritorio[0];
    } else {
      if (this.promocionForm.value.accion === "CREAR") {
        this.toastr.error(`Subir imagen`, 'Imagen', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        return;
      }
    }
    // Utilizamos console.log para ver comprobar que en realidad contiene algo el arreglo
    this.GuardarInformacion = true;
    this.promocion.gestionarPromociones(this.promocionForm.value, file).pipe(
      takeUntil(this.Unsuscribe)
      , finalize(() => {
        this.reload_producto.next();
        this.GuardarInformacion = false;
        $('#exampleModalPromocion').modal('hide');
      })).subscribe({
        next: (res) => {
          this.toastr.success(`Slider ${res} con exito`, undefined, {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        },
        error: (error) => {
          this.toastr.error('Ubo un erro en gestionar el slider', 'VERIFICAR', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      })
  }


  EliminarPromocion(id_promocion: number) {
    Swal.fire({
      title: `¿Estas seguro de eliminar la Promocion?`,
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.promocion.eliminarPromocion(id_promocion).pipe(takeUntil(this.Unsuscribe), finalize(() => {
          this.reload_producto.next();
        })).subscribe({
          next: (res) => {
            Swal.fire(
              'Listo!',
              `Promoción eliminado con Exito.`,
              'success'
            )
          },
          error: (error) => {
            Swal.fire(
              'Error!',
              `Verificar Promoción.`,
              'error'
            )
          }
        })


      }
    })

  }
  EditarPromocion(item: any) {
    this.limpiarEditorQuill();
    const quill:any = this.descripcion_promocion?.quillEditor;
    quill.clipboard.dangerouslyPasteHTML(item.descripcion_promocion);//Pega el contenido HTML utilizando clipboard.dangerouslyPasteHTML
    this.promocionForm.get('id_promocion')!.setValue(item.id_promocion);
    this.promocionForm.get('accion')!.setValue('ACTUALIZAR');
    this.promocionForm.get('titulo_promocion')!.setValue(item.titulo_promocion);
    this.promocionForm.get('fecha_promocion')!.setValue(item.fecha_promocion);
    this.promocionForm.get('descripcion_promocion')!.setValue(item.descripcion_promocion);
    this.Helper.resetPreview('file_escritorio_promocion', item.url_promocion, item.id_url_promocion);
    this.texto_cabezera = 'EDITAR PROMOCIÓN';
    $('#exampleModalPromocion').modal('show');
  }

  limpiarEditorQuill() {
    // Limpia el contenido del editor
    this.descripcion_promocion?.quillEditor.setText('');

  }

}
