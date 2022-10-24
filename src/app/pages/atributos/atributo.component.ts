import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { CategoriaService } from '../../services/categoria.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, finalize } from 'rxjs';
import { DataTablesResponse } from 'src/app/interface/Datatable';
import { AtributoService } from '../../services/atributo.service';
declare var $: any;
declare var Swal: any;
@Component({
  selector: 'app-atributo',
  templateUrl: './atributo.component.html',
  styleUrls: ['./atributo.component.css']
})
export class AtributoComponent implements OnInit {
  @ViewChild('GuardarAtibuto') GuardarAtibuto!: ElementRef;

  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  listarProducto: any = [];
  listarProductoDeshabilitado: any = [];
  tipo_inventario?: any = [];
  categoriaForm!: FormGroup;
  editor: any;
  texto_cabezera: any;
  constructor(private http: HttpClient,
    private servicio_login: LoginService,
    private servicio_atributo: AtributoService,
    private fb: FormBuilder

  ) { }
  ngOnInit(): void {
    // $('.textarea_editor').wysihtml5();

    this.editor = $('.textarea_editor').wysihtml5().data('wysihtml5').editor;
    this.categoriaForm = this.fb.group({
      id_atributo: [''],
      glosa_atributo: ['', [Validators.required]],
      descripcion_atributo: [''],
      accion: ['CREAR'],
    });
    this.token = this.servicio_login.getToken();
    this.CategoriaHabilitados();
    this.CategoriasDeshabilitados();
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
    $("#treeview").hummingbird();
    $(document).on("click", "input[name='atributo_padre']", (elemento: any) => {
      //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
      // $("input[name='atributo_padre']:checked").each((i: any, elemento: any) => {
      //   checked.push(($(elemento).attr("value")));
      // });
      // console.log(checked.length);
      // if (checked.length == 1 || checked.length == 0) {
      //   if ($(elemento.target).is(':checked')) {
      //     $(".selector-categoria").prop("disabled", true);
      //     $(elemento.target).prop("disabled", false);
      //   } else {
      //     $(".selector-categoria").prop("disabled", false);
      //   }
      // } else {
      //   $(elemento.target).prop("checked", false);
      //   Swal.fire({
      //     toast: true,
      //     position: 'top',
      //     icon: 'error',
      //     title: 'Ya tiene seleccionado 1 atributo',
      //     showConfirmButton: false,
      //     timerProgressBar: true,
      //     timer: 5000
      //   })
      // }
      if ($(elemento.target).is(':checked')) {
        $(".selector-categoria").prop("checked", false);
        $(elemento.target).prop("checked", true);
      } else {
        $(".selector-categoria").prop("checked", false);
      }

    })
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
          "http://localhost/MVC_NEURO/?controller=Atributo&action=ListaAtributo",
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
          width: "40%"
        },
        {
          width: "40%"
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
          "http://localhost/MVC_NEURO/?controller=Atributo&action=ListaAtributoDeshabilitado",
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
          width: "20%"
        },
        {
          width: "40%"
        },
        {
          width: "40%"
        }
      ],
    };
  }

  AbrirModal() {
    this.categoriaForm.reset();
    this.categoriaForm.get('accion')!.setValue('CREAR');
    this.editor.setValue('');
    $("#t-crear-categoria").html('');
    this.listarCategorias();
    this.texto_cabezera = 'Nuevo Atributo';

    $('#exampleModalCenter').modal('show');
  }

  listarCategorias() {
    this.servicio_atributo.CargarAtributo(this.token).pipe(finalize(() => {
    })).subscribe(
      {
        next: (arreglo) => {
          var html = "";
          var vacio = "";
          if (arreglo.atributo == null) {
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 25vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
          } else {
            $.each(arreglo.atributo, (i: any, data: any) => {
              html += "<li><i class=\"fa fa-minus\"></i>";
              html += `
            <label  class="inline custom-control custom-checkbox block"><input id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox"  class="custom-control-input selector-categoria" >
            <span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
              if (typeof data.subatributo !== 'undefined') {
                html += this.arbolSubcategoria(data.subatributo);
              } else {
                html += "<h6 hidden class='marcador-subcategoria' >SubAtributo</h6>";
              }
              html += "</li>";
            });
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 25vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
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

  arbolSubcategoria(subatributo: any) {
    var html = "";
    html += "<ul style='display:block;list-style: none;' >";
    if (typeof subatributo !== 'undefined') {
      $.each(subatributo, (i: any, data: any) => {
        html += `<li><i class='fa fa-minus'></i> 
        <label  class="inline custom-control custom-checkbox block"><input id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
        if (typeof data.subatributo !== 'undefined') {
          html += this.arbolSubcategoria(data.subatributo);
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
    this.categoriaForm.get('descripcion_atributo')!.setValue(this.editor.getValue());
    this.categoriaForm.markAllAsTouched();
    if (this.categoriaForm.invalid) {
      return;
    }
    var checked: any = [];

    //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
    $("input[name='atributo_padre']:checked").each((i: any, elemento: any) => {
      //Mediante la función push agregamos al arreglo los values de los checkbox
      checked.push(($(elemento).attr("value")));
    });
    // Utilizamos console.log para ver comprobar que en realidad contiene algo el arreglo
    this.GuardarAtibuto.nativeElement.setAttribute('disabled', '')
    this.servicio_atributo.GestionarAtributo(this.token, this.categoriaForm.value, checked).pipe(finalize(() => {
      this.reload_producto.next();
      $('#exampleModalCenter').modal('hide');
      this.GuardarAtibuto.nativeElement.removeAttribute('disabled')

    })).subscribe({
      next: (res) => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: `Atributo ${res} con exito`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })

      },
      error: (error) => {

      }
    })
  }

  listarCategoriasEditar(atributoPadre: any, id_atributo: any) {
    var idAtributo = id_atributo;
    var id_atributo_padre = atributoPadre;
    this.servicio_atributo.CargarAtributo(this.token).pipe(finalize(() => {
    })).subscribe(
      {
        next: (arreglo) => {
          var html = "";
          var elemento = '';
          var vacio = "";
          if (arreglo.atributo == null) {
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 25vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
          } else {
            $.each(arreglo.atributo, (i: any, data: any) => {
              html += "<li>";
              if (data.id_atributo == idAtributo && data.id_padre == 0) {

              } else {
                if (data.id_atributo == id_atributo_padre) {
                  html += `<i class="fa fa-minus"></i><label  class="inline custom-control custom-checkbox block">
                  <input id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox" formcontrolname="visible_tienda"
                   class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
                  elemento += `<input  class="selector-categoria" name='atributo_padre' id="${data.id_atributo}"   type='checkbox' value='${data.id_atributo}'>`;
                } else {
                  html += `<i class="fa fa-minus"></i>
                  <label  class="inline custom-control custom-checkbox block">
                  <input id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox" formcontrolname="visible_tienda"
                   class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
                }
                if (typeof data.subatributo !== 'undefined') {
                  html += this.arbolSubcategoriaEditar(data.subatributo, id_atributo_padre, idAtributo);
                } else {
                  html += "<h6 hidden class='marcador-subcategoria'>SubAtributo</h6>";
                }
              }
              html += "</li>";
            });
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 25vh; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
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

  arbolSubcategoriaEditar(subatributo: any, atributo_padre: any, idCategoria_: any) {
    var atributo_padre = atributo_padre;
    var idCategoria = idCategoria_;

    var html = "";
    html += "<ul style='display:block;list-style: none;'>";
    if (typeof subatributo !== 'undefined') {
      $.each(subatributo, (i: any, data: any) => {
        if (data.id_atributo == idCategoria) {
        } else {
          if (atributo_padre == data.id_atributo) {
            html += `<li> <i class="fa fa-minus"></i>   
            <label  class="inline custom-control custom-checkbox block"><input id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" >
            <span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span>
            </label>`;
          } else {
            html += `<li><i class="fa fa-minus"></i>
             <label  class="inline custom-control custom-checkbox block"><input id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" >
             <span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span>
             </label>`;
          }
          if (typeof data.subatributo !== 'undefined') {
            html += this.arbolSubcategoriaEditar(data.subatributo, atributo_padre, idCategoria);
          } else {
            html += "<h6  hidden class='marcador-subatributo-hijo'>subatributo hijo</h6>";
          }
        }
        html += "</li>";

      });
    };
    html += "</ul>";
    return html;
  }

  TraerCategoria(id_atributo: any) {
    this.texto_cabezera = 'Editar Atributo';
    this.servicio_atributo.TraerCategoria(this.token, id_atributo).subscribe({
      next: (resp: any) => {
        this.categoriaForm.get('id_atributo')!.setValue(resp.id_atributo);
        this.categoriaForm.get('glosa_atributo')!.setValue(resp.glosa_atributo);
        this.categoriaForm.get('descripcion_atributo')!.setValue(resp.descripcion_atributo);
        this.categoriaForm.get('accion')!.setValue('EDITAR');
        this.editor.setValue(resp.descripcion_atributo);
        this.listarCategoriasEditar(resp.id_padre_atributo, resp.id_atributo);

      }, error: (error) => {

      }
    })


    $('#exampleModalCenter').modal('show');

  }

  Habilitar_Deshabilitar_Categoria(id_atributo: number, accion: string) {
    let texto = '';
    if (accion == "activado") {
      texto = "activar";
    } else {
      texto = "desactivar";
    }
    Swal.fire({
      title: `¿Esta seguro de ${texto} el atributo?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.value) {
        this.servicio_atributo.Habilitar_Deshabilitar_Categoria(this.token, id_atributo, accion).subscribe({
          next: (res) => {

            Swal.fire(
              `Atributo ${accion}!`,
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


}
