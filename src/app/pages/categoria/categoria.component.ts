import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { CategoriaService } from '../../services/categoria.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTablesResponse } from 'src/app/interface/Datatable';


declare var $: any;
declare var hummingbird: any;
declare var Swal: any;


@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements AfterViewInit, OnDestroy, OnInit {
  titulo_texto:string='';
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
  editor: any;

  private unsubscribe$ = new Subject<void>();
  constructor(private http: HttpClient,
    private servicio_login: LoginService,
    private servicio_categoria: CategoriaService,
    private fb: FormBuilder

  ) { }
  ngOnInit(): void {
    // $('.textarea_editor').wysihtml5();

    this.editor = $('.textarea_editor').wysihtml5().data('wysihtml5').editor;


    this.categoriaForm = this.fb.group({
      id_categoria: [''],
      glosa_categoria: ['', [Validators.required]],
      id_tipo_inventario: ['', [Validators.required]],
      descripcion_categoria: [''],
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

      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.usuario_id = "Prueba";
        this.http.post<DataTablesResponse>(
          "http://localhost/MVC_CRM/?controller=Categoria&action=ListaCategoria",
          dataTablesParameters, { headers: headers }
        ).pipe(takeUntil(this.unsubscribe$))
          .subscribe((resp) => {
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
      order: [],
      // scrollX:true,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json",
      },
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.usuario_id = "Prueba";
        this.http.post<DataTablesResponse>(
          "http://localhost/MVC_CRM/?controller=Categoria&action=ListaCategoriaDeshabilitado",
          dataTablesParameters, { headers: headers }
        ).pipe(takeUntil(this.unsubscribe$))
          .subscribe((resp) => {
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
    this.categoriaForm.reset();
    this.categoriaForm.get('id_tipo_inventario')!.setValue('');
    this.categoriaForm.get('visibleOnline')!.setValue(true);
    this.categoriaForm.get('accion')!.setValue('CREAR');
    this.editor.setValue('');
    $("#t-crear-categoria").html('');
    this.imgTemporal = null;
    this.titulo_texto='Nueva Categoría';
    $('#exampleModalCenter').modal('show');
  }

  listarCategorias(valor_inventario: any) {
    this.servicio_categoria.CargarCategoria(this.token, valor_inventario.value).pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        {
          next: (arreglo) => {
            var html = "";
            var vacio = "";
            if (arreglo.categoria == null) {
              var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 40vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
            } else {
              $.each(arreglo.categoria, (i: any, data: any) => {
                html += "<li><i class=\"fa fa-minus\"></i>";
                html += `<label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
                if (typeof data.subcategoria !== 'undefined') {
                  html += this.arbolSubcategoria(data.subcategoria);
                } else {
                  html += "<h6 hidden class='marcador-subcategoria' >Subcategoria</h6>";
                }
                html += "</li>";
              });
              var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 40vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
            }
            $("#t-crear-categoria").html(estructura_html);
            $(".marcador-subcategoria").parent().find("label").children().removeAttr('hidden');
            $(".marcador-subcategoria-hijo").parent().find("label").children().removeAttr('hidden');
            $(".marcador-subcategoria").parent().find("i").css("pointer-events", "none").css("color", "#fff");
            $(".marcador-subcategoria-hijo").parent().find("i").css("pointer-events", "none").css("color", "#fff");
            $("#treeview").hummingbird();
          }, error: (error) => {

          }
        }
      )
  }

  arbolSubcategoria(subcategoria: any) {
    var html = "";
    html += "<ul style='display:block;list-style: none;' >";
    if (typeof subcategoria !== 'undefined') {
      $.each(subcategoria, (i: any, data: any) => {
        html += `<li><i class='fa fa-minus'></i> 
        <label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>
        `;
        if (typeof data.subcategoria !== 'undefined') {
          html += this.arbolSubcategoria(data.subcategoria);
        } else {
          html += "<h6  hidden class='marcador-subcategoria-hijo'>Subcategoria hijo</h6>";
        }
        html += "</li>";

      });
    };
    html += "</ul>";
    return html;
  }

  GuardarActualizarCategoria() {
    //NOTA GUARDAMOS EL TEXTO ENRIQUECIDO EN LA DESCRIPCION
    this.categoriaForm.get('descripcion_categoria')!.setValue(this.editor.getValue());
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
    this.servicio_categoria.GestionarCategoria(this.token, this.categoriaForm.value, checked, this.imagenSubir).pipe(finalize(() => {
      this.reload_producto.next();
      $('#exampleModalCenter').modal('hide');
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

  listarCategoriasEditar(valor: any, categoriaPadre: any, idCategoria: any) {
    var idCategoria_ = idCategoria;
    var id_cat_padre = categoriaPadre;
    this.servicio_categoria.CargarCategoria(this.token, valor).pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        {
          next: (arreglo) => {
            var html = "";
            var elemento = '';
            var vacio = "";
            if (arreglo.categoria == null) {
              var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 40vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
            } else {
              $.each(arreglo.categoria, (i: any, data: any) => {
                html += "<li>";
                if (data.id_categoria == idCategoria_ && data.id_padre == 0) {

                } else {
                  if (data.id_categoria == id_cat_padre) {
                    html += `<i class="fa fa-minus"></i>
                  <label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
                    elemento += `<input  class="selector-categoria" name='categoria_padre' id="${data.id_categoria}"   type='checkbox' value='${data.id_categoria}'>`;

                  } else {
                    html += `<i class="fa fa-minus"></i>
                  <label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
                  }
                  if (typeof data.subcategoria !== 'undefined') {
                    html += this.arbolSubcategoriaEditar(data.subcategoria, id_cat_padre, idCategoria_);
                  } else {
                    html += "<h6 hidden class='marcador-subcategoria' >Subcategoria</h6>";
                  }
                }
                html += "</li>";
              });
              var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 40vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
            }
            $("#t-crear-categoria").html(estructura_html);
            $(elemento).trigger("click");
            $(".marcador-subcategoria").parent().find("label").children().removeAttr('hidden');
            $(".marcador-subcategoria-hijo").parent().find("label").children().removeAttr('hidden');
            $(".marcador-subcategoria").parent().find("i").css("pointer-events", "none").css("color", "#fff");
            $(".marcador-subcategoria-hijo").parent().find("i").css("pointer-events", "none").css("color", "#fff");
            $("#treeview").hummingbird();

          }, error: (error) => {

          }
        }
      )



  }

  arbolSubcategoriaEditar(subcategoria: any, categoria_padre: any, idCategoria_: any) {
    var cate_padre = categoria_padre;
    var idCategoria = idCategoria_;

    var html = "";
    html += "<ul style='display:block;list-style: none;'>";
    if (typeof subcategoria !== 'undefined') {
      $.each(subcategoria, (i: any, data: any) => {
        if (data.id_categoria == idCategoria) {

        } else {
          if (cate_padre == data.id_categoria) {
            // html += "<li><i class=\"fa fa-minus\"></i> <label><input checked name='editar_categoria_padre'   type='checkbox' value='" + data.id_categoria + "'> " + data.glosa_categoria + "</label>";
            html += `<li><i class=\"fa fa-minus\"></i>
            <label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>
            `;

          } else {
            // html += "<li><i class=\"fa fa-minus\"></i> <label><input name='editar_categoria_padre'   type='checkbox' value='" + data.id_categoria + "'> " + data.glosa_categoria + "</label>";
            html += `<li><i class=\"fa fa-minus\"></i>
            <label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>
            `;

          }
          if (typeof data.subcategoria !== 'undefined') {
            html += this.arbolSubcategoriaEditar(data.subcategoria, cate_padre, idCategoria);
          } else {
            html += "<h6  hidden class='marcador-subcategoria-hijo'>Subcategoria hijo</h6>";
          }
        }
        html += "</li>";

      });
    };
    html += "</ul>";
    return html;
  }

  TraerCategoria(id_categoria: any) {
    this.titulo_texto='Editar Categoría';
    this.servicio_categoria.TraerCategoria(this.token, id_categoria)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (resp: any) => {
          this.categoriaForm.get('id_categoria')!.setValue(resp.id_categoria);
          this.categoriaForm.get('glosa_categoria')!.setValue(resp.glosa_categoria);
          this.categoriaForm.get('id_tipo_inventario')!.setValue(`${resp.id_tipo_inventario}`);
          this.categoriaForm.get('descripcion_categoria')!.setValue(resp.descripcion_categoria);
          this.categoriaForm.get('accion')!.setValue('EDITAR');
          this.editor.setValue(resp.descripcion_categoria);
          let visible = false;
          if (resp.visibleonline_categoria) {
            visible = true;
          }
          this.categoriaForm.get('visibleOnline')!.setValue(visible);
          this.listarCategoriasEditar(resp.id_tipo_inventario, resp.id_categoria_padre, resp.id_categoria);
          if (resp.pathimagen_categoria) {
            this.imgTemporal = resp.pathimagen_categoria;
          } else {
            this.imgTemporal = null;

          }

        }, error: (error) => {

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
