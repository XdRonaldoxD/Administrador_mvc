import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subject, takeUntil } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { HelpersService } from 'src/app/services/helpers.service';
import { LoginService } from 'src/app/services/login.service';
import { SliderService } from 'src/app/services/slider.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild("foto") foto?: ElementRef;
  @ViewChild("foto_mobile") foto_mobile?: ElementRef;
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  listarProducto: any = [];
  listarProductoDeshabilitado: any = [];
  sliderForm!: FormGroup;
  texto_cabezera: string='';
  Unsuscribe: any = new Subject();
  api_url: string = environment.api_url;
  environment: any;

  constructor(private http: HttpClient,
    private slider: SliderService,
    private fb: FormBuilder,
    private servicio_login: LoginService,
    private toastr: ToastrService,
    private Helper: HelpersService,
    private el: ElementRef

  ) {
    this.sliderForm = this.fb.group({
      id_slider: [null],
      id_categoria: [null],
      titulo_slider: ['', [Validators.required]],
      file_escritorio: [],
      file_mobile: [],
      texto_slider: [''],
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
    this.SliderDeshabilitados();
    $(".select2").select2();
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


  SliderHabilitados() {
    this.dtOptions[0] = this.createDtOptions(1);
  }

  SliderDeshabilitados() {
    this.dtOptions[1] = this.createDtOptions(0);
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
          environment.api_url + "&controller=Slider&action=ListarSlider",
          dataTablesParameters, { headers: headers }
        ).subscribe((resp) => {
          if (vigente_slider === 1) {
            this.listarProducto = resp.data;
          } else {
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
          width: "20%"
        },
        {
          width: "30%"
        },
        {
          width: "25%"
        },
        {
          width: "25%"
        },
      ],
    };
  }

  AbrirModal() {
    $(".dropify-clear").click();
    $("#id_categoria").empty();
    this.sliderForm.reset();
    this.sliderForm.get('accion')!.setValue('CREAR');
    $("#t-crear-categoria").html('');
    this.texto_cabezera = 'NUEVO SLIDER';
    $("#id_categoria").select2({
      dropdownParent: $("#exampleModalCenter"),
      width: "100%",
      ajax: {
        url: environment.api_url + "&controller=Categoria&action=FiltrarCategoria", //URL for searching companies
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
                text: item.glosa_categoria,
                id: item.id_categoria
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
      placeholder: "Busque una categoria",
      minimumInputLength: 3
    });
    $('#exampleModalCenter').modal('show');

  }

  GuardarActualizarCategoria() {
    this.sliderForm.get('id_categoria')!.setValue($("#id_categoria").val());
    this.sliderForm.markAllAsTouched()
    if (this.sliderForm.invalid) {
      return;
    }
    let file = null;
    let file_mobile = null;
    const imagen_escritorio = this.foto?.nativeElement.files;
    if (imagen_escritorio.length > 0) {
      file = imagen_escritorio[0];
    } else {
      if (this.sliderForm.value.accion === "CREAR") {
        this.toastr.error(`Subir imagen tamaño escritorio`, undefined, {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        return;
      }
    }
    const imagen_mobile = this.foto_mobile?.nativeElement.files;
    if (imagen_mobile.length > 0) {
      file_mobile = imagen_mobile[0];
    } else {
      if (this.sliderForm.value.accion === "CREAR") {
        this.toastr.error(`Subir imagen tamaño mobile`, undefined, {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        return;
      }
    }

    // Utilizamos console.log para ver comprobar que en realidad contiene algo el arreglo
    this.slider.ActualizarCrearSlider(this.sliderForm.value, file, file_mobile).pipe(
      takeUntil(this.Unsuscribe)
      , finalize(() => {
        this.reload_producto.next();
        $('#exampleModalCenter').modal('hide');
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


  EstadoSlider(accion: string, id_slider: number) {
    let texto = '';
    if (accion == 'ACTIVAR') {
      texto = "activar";
    } else {
      texto = "deshabilitar";
    }
    Swal.fire({
      title: `¿Estas seguro de ${texto} Slider?`,
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.slider.GestionActivoDesactivadoSlider(id_slider, accion).pipe(finalize(() => {
          this.reload_producto.next();
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
  EditarSlider(item: any) {
    //MOTIVO CUANDO HABRO UN MODAL DESDE OTRO MODULO SE QUEDA PEGADO Y PARA INICIALIZARLO ME TOMA DE ESTA MANERA
    $("#id_categoria").select2({
      dropdownParent: $("#exampleModalCenter"),
      width: "100%",
      ajax: {
        url: environment.api_url + "&controller=Categoria&action=FiltrarCategoria", //URL for searching companies
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
                text: item.glosa_categoria,
                id: item.id_categoria
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
      placeholder: "Busque una categoria",
      minimumInputLength: 3
    });
    //---------------------------------------------------------
    this.sliderForm.get('id_slider')!.setValue(item.id_slider);
    this.sliderForm.get('accion')!.setValue('ACTUALIZAR');
    this.sliderForm.get('id_categoria')!.setValue(item.id_categoria);
    this.sliderForm.get('titulo_slider')!.setValue(item.nombre_slider);
    this.Helper.resetPreview('file_escritorio',item.rutacritorio_slider, item.pathescritorio_slider);
    this.Helper.resetPreview('file_mobile', item.rutamobile_slider, item.pathmobile_slider);
    let html = `<option value=${item.id_categoria}>${item.glosa_categoria}</option>`;
    $("#id_categoria").html(html);
    this.texto_cabezera = 'EDITAR SLIDER';
    $('#exampleModalCenter').modal('show');
  }




}
