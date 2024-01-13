import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { CategoriaService } from '../../services/categoria.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { animate, style, transition, trigger } from '@angular/animations';
declare var $: any;
declare var Swal: any;
@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css'],
  animations: [
    trigger('slideInFromLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class CategoriaComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  titulo_texto: string = '';
  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  imgTemporal: string | null = '';
  imagenSubir: File | undefined | null;

  //Identificacion del usuario
  identity: any;
  token: any;
  listarProducto: any = [];
  listarProductoDeshabilitado: any = [];
  tipo_inventario?: any = [];
  categoriaForm!: FormGroup;
  cantidadProducto: any = 0;
  cantidadProductoDeshabilitado: any = 0;
  GuardarInformacion: boolean = false;
  private unsubscribe$ = new Subject<void>();
  constructor(private http: HttpClient,
    private servicio_login: LoginService,
    private servicio_categoria: CategoriaService,
    private fb: FormBuilder,
    private el: ElementRef,
    private toastr: ToastrService
  ) { }
  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    this.categoriaForm = this.fb.group({
      id_categoria: [''],
      glosa_categoria: ['', [Validators.required]],
      id_tipo_inventario: ['', [Validators.required]],
      descripcion_categoria: [''],
      codigo_categoria: [''],
      visibleOnline: [true],
      accion: ['CREAR'],
    });
    this.token = this.servicio_login.getToken();
    this.CategoriaHabilitados();
    this.CategoriasDeshabilitados();
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
    $("#treeview").hummingbird();
    $(document).on("click", "input[name='categoria_padre']", (elemento: any) => {

      if ($(elemento.target).is(':checked')) {
        $(".selector-categoria").prop("checked", false);
        $(elemento.target).prop("checked", true);
      } else {
        $(".selector-categoria").prop("checked", false);
      }

    })



    this.servicio_categoria.Inventario(this.token).pipe(finalize(() => {
      $("#t-crear-categoria").children("div").remove();
      var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 40vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
      $("#t-crear-categoria").html(estructura_html);
    })).pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        {
          next: (res) => {
            this.tipo_inventario = res;

          }, error: (error) => {

          }
        }
      )
  }
  //NOTA PARA EL FUNCIONAMIENTO DEL RELOAD APLICAR EN EL TYPYSCRYP Y HTML EL reload_producto
  //SOLO LLAMAR LA FUNCION => this.reload_producto.next();
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the  (Datatable)
    this.reload_producto.unsubscribe();
    this.reload_producto_deshabilitado.unsubscribe();

    //PARA FINALIZAR SUBCRIBRE
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  ngAfterViewInit(): void {
    this.reload_producto.next();
    this.reload_producto_deshabilitado.next();
    $(this.el.nativeElement).find('.textarea_editor').summernote({
      height: 60,
      minHeight: null,
      maxHeight: null,
      focus: false,
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        // ['table', ['table']]
        // ['insert', ['link', 'picture', 'video']],
        // ['view', ['fullscreen', 'codeview', 'help']],
      ],
      callbacks: {
        onChange: (contents: any) => {
          this.categoriaForm.get('descripcion_categoria')!.setValue(contents);
        }
      }
    });
  }
  //FIN


  CategoriaHabilitados() {
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
          environment.api_url + "&controller=Categoria&action=ListaCategoria",
          dataTablesParameters, { headers: headers }
        ).pipe(takeUntil(this.unsubscribe$))
          .subscribe((resp) => {
            this.listarProducto = resp.data;
            this.cantidadProducto = resp.recordsTotal;
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
          width: "25%"
        },
        {
          width: "25%"
        },
        {
          width: "25%"
        }
      ],
    };
  }

  CategoriasDeshabilitados() {
    let headers = new HttpHeaders()
      .set('Authorization', this.token);
    this.dtOptions[1] = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      destroy: true,
      ordering: false,
      order: [],
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
          environment.api_url + "&controller=Categoria&action=ListaCategoriaDeshabilitado",
          dataTablesParameters, { headers: headers }
        ).pipe(takeUntil(this.unsubscribe$))
          .subscribe((resp) => {
            this.listarProductoDeshabilitado = resp.data;
            this.cantidadProductoDeshabilitado = resp.recordsTotal;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          });
      },
      columns: [
        {
          width: "25%"
        },
        {
          width: "25%"
        },
        {
          width: "25%"
        }
      ],
    };
  }

  AbrirModal() {
    let cantidad = this.cantidadProducto + this.cantidadProductoDeshabilitado + 1;
    let codigo = `CAT-${cantidad}`;
    this.categoriaForm.reset();
    this.categoriaForm.get('id_tipo_inventario')!.setValue('');
    this.categoriaForm.get('visibleOnline')!.setValue(true);
    this.categoriaForm.get('codigo_categoria')!.setValue(codigo);
    this.categoriaForm.get('accion')!.setValue('CREAR');
    $("#t-categoria").html('');
    this.imgTemporal = null;
    this.titulo_texto = 'Nueva Categoría';
    this.fileInput.nativeElement.value = '';
    $('#exampleModalCenter').modal('show');
  }

  listarCategorias(valorInventario: any, id_categoria_a_mostrar: any = null) {
    this.servicio_categoria.CargarCategoria(this.token, valorInventario.value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (arreglo) => {
          var html = "";
          if (arreglo.categoria == null) {
            var estructura_html:any = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
          } else {
            let shouldShowTree = true; // Flag to determine if the tree should be shown
            arreglo.categoria.forEach((data: any) => {
              if (data.id_categoria === id_categoria_a_mostrar) {
                shouldShowTree = false; // Category and its subcategories match, don't show the tree
              }
              html += "<li class='categoria-item'><i class=\"fa fa-plus\"></i>";
              html += `<label class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}_categoria" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
              if (typeof data.subcategoria !== 'undefined') {
                html += this.arbolSubcategoria(data.subcategoria, id_categoria_a_mostrar);
              } else {
                html += "<h6 hidden class='marcador-subcategoria' >Subcategoría</h6>";
              }
              html += "</li>";
            });
  
            if (shouldShowTree) {
              var estructura_html:any = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
            }
          }
          $("#t-categoria").html(estructura_html);
          $(".marcador-subcategoria").parent().find("label").children().removeAttr('hidden');
          $(".marcador-subcategoria-hijo").parent().find("label").children().removeAttr('hidden');
          $("#treeview").hummingbird();
        },
        error: (error) => {
          // Manejar error
        }
      });
  }
  arbolSubcategoria(subcategoria: any, id_categoria_a_mostrar: any) {
    var html = "<ul style='list-style: none; display: none;'>"; // Añade display: none para ocultar las subcategorías inicialmente
    if (typeof subcategoria !== 'undefined') {
      subcategoria
        .filter((data: any) => data.id_categoria !== id_categoria_a_mostrar) // Filtra las categorías a mostrar
        .forEach((data: any) => {
          var tieneSubcategoria = typeof data.subcategoria !== 'undefined';
          html += `<li class='categoria-item'><i class='fa ${tieneSubcategoria ? "fa-plus" : "fa-minus"}'></i>
            <label  class="inline custom-control custom-checkbox block">
              <input id="${data.id_categoria}_categoria" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria">
              <span class="custom-control-indicator"></span>
              <span class="custom-control-description ml-0">${data.glosa_categoria}</span>
            </label>`;
          if (tieneSubcategoria) {
            html += this.arbolSubcategoria(data.subcategoria, id_categoria_a_mostrar);
          } else {
            html += "<h6 hidden class='marcador-subcategoria-hijo'>Subcategoría hijo</h6>";
          }
          html += "</li>";
        });
    }
    html += "</ul>";
    return html;
  }


  GuardarActualizarCategoria() {
    //NOTA GUARDAMOS EL TEXTO ENRIQUECIDO EN LA DESCRIPCION
    this.categoriaForm.markAllAsTouched()
    if (this.categoriaForm.invalid) {
      return;
    }
    var checked: any = [];
    //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
    $("input[name='categoria_padre']:checked").each((i: any, elemento: any) => {
      //Mediante la función push agregamos al arreglo los values de los checkbox
      checked.push(($(elemento).attr("value")));
    });
    // Utilizamos console.log para ver comprobar que en realidad contiene algo el arreglo
    this.GuardarInformacion = true;
    this.servicio_categoria.GestionarCategoria(this.token, this.categoriaForm.value, checked, this.imagenSubir).pipe(takeUntil(this.unsubscribe$), finalize(() => {
      this.reload_producto.next();
      $('#exampleModalCenter').modal('hide');
      this.GuardarInformacion = false;
    }),
      takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: `Categoria ${res} con exito`,
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })

        },
        error: (error) => {

        }
      })
  }


  TraerCategoria(id_categoria: any) {
    this.titulo_texto = 'Editar Categoría';
    this.servicio_categoria.TraerCategoria(this.token, id_categoria)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (resp: any) => {
          this.categoriaForm.reset({
            id_categoria: resp.id_categoria,
            glosa_categoria: resp.glosa_categoria,
            id_tipo_inventario: `${resp.id_tipo_inventario}`,
            codigo_categoria: `${resp.codigo_categoria ?? ''}`,
            descripcion_categoria: resp.descripcion_categoria,
            accion: 'EDITAR',
            visibleOnline: resp.visibleonline_categoria ? true : false,
          });
          let id_tipo_inventario = {
            value: resp.id_tipo_inventario
          }
          this.listarCategorias(id_tipo_inventario, resp.id_categoria);
          this.imgTemporal = null;
          this.fileInput.nativeElement.value = '';
          if (resp.pathimagen_categoria) {
            this.imgTemporal = resp.pathimagen_categoria;
          }
        }, error: (error) => {
          this.toastr.error(`Error al traer la categoria.`, undefined, {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      })
    $('#exampleModalCenter').modal('show');
  }

  Habilitar_Deshabilitar_Categoria(id_categoria: number, accion: string) {
    let texto = '';
    if (accion == "activado") {
      texto = "activar";
    } else {
      texto = "desactivar";
    }
    Swal.fire({
      title: `¿Esta seguro de ${texto} la categoria?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.value) {
        this.servicio_categoria.Habilitar_Deshabilitar_Categoria(this.token, id_categoria, accion)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (res) => {

              Swal.fire(
                `Categoria ${accion}!`,
                `${accion}`,
                'success'
              )
              this.reload_producto.next();
              this.reload_producto_deshabilitado.next();
            }, error: (erro) => {

            }

          })


      }
    })

  }


  seleccioneImagen(imagen: any) {
    if (imagen.files[0].type.indexOf("image") < 0) {
      Swal.fire(
        "Sólo imágenes",
        "El Archivo seleccionado no es una imagen",
        "error"
      );
      this.imagenSubir = null;
      return;
    }

    this.imagenSubir = imagen.files[0];

    let reader: any = new FileReader();
    let urlImagentemp = reader.readAsDataURL(this.imagenSubir);
    reader.onloadend = () => (this.imgTemporal = reader.result as string);
  }

}
