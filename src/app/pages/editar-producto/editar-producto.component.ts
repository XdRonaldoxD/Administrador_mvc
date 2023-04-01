import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { LoginService } from '../../services/login.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ProductoService } from '../../services/producto.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AtributoService } from '../../services/atributo.service';
import { Atributo_seleccionado } from 'src/app/interface/Datatable';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;
declare var document: any;
declare var Swal: any;


@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css']
})
export class EditarProductoComponent implements OnInit, OnDestroy {
  token: any;
  buttonDisabled: boolean = false;
  tipo_inventario?: any = [];
  imagenes_producto?: any = [];
  producto_relacionado: any = '';
  listaProductosRelacionado: any = [];
  glosa_global_producto: any;
  path_global_producto: any;
  listarProductoRelacionados: any = [];
  informacionForm!: FormGroup;
  PrecioStockForm!: FormGroup;
  descripcion_extendida: any;
  descripcion_corta: any;
  checked_atributo: Atributo_seleccionado[] = [];
  checked_categoria: any = [];
  color: any;
  contador_texto: any;
  verificador_sku: boolean = false;
  Unsuscribe: any = new Subject();

  constructor(
    private servicio_categoria: CategoriaService,
    private servicio_login: LoginService,
    private producto_serv: ProductoService,
    private servicio_atributo: AtributoService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,

  ) {
    this.informacionForm = this.fb.group({
      id_producto: ['', [Validators.required]],
      codigo_producto: ['', [Validators.required]],
      tipo_inventario: ['', [Validators.required]],
      visible_tienda: [false],
      descripcion_corta: [],
      descripcion_extendida: [],
      glosa_producto: []

    });
    this.PrecioStockForm = this.fb.group({
      precio_venta: ['', [Validators.required]],
      stock: ['', [Validators.required]],
      precio_costo: [],

    });
    this.token = this.servicio_login.getToken();
    this.listarAtributo();

  }

  ngOnDestroy(): void {
    this.Unsuscribe.unsubscribe();


  }
  ngOnInit(): void {
    this.descripcion_corta = $('.descripcion_extendida').wysihtml5().data('wysihtml5').editor;
    this.descripcion_extendida = $('.descripcion_corta').wysihtml5().data('wysihtml5').editor;
    this.route.params.subscribe((parametro) => {
      // let producto_oferta: any = null;
      // this.route.queryParamMap.subscribe((params) => {
      //     producto_oferta = { ...params.keys, ...params };
      // });
      this.producto_serv.ListaProductosRelacionado(this.token, parametro['id_producto']).subscribe({
        next: resp => {
          // resp=resp.map((items:any)=> items.id_producto!==parametro['id_producto'])
          this.listaProductosRelacionado = resp;
        },
        error: erro => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'error',
            title: 'Error en los productos relacionados.',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })
        }
      })

      this.producto_serv.TraerProductosID(parametro['id_producto'], this.token).pipe(finalize(() => {
        setTimeout(() => {
          this.checked_atributo.forEach((element: any) => {
            $(`#${element.id_atributo}_atributo`).prop('checked', true);
          });

          this.checked_categoria.forEach((element: any) => {
            $(`#${element}_categoria`).prop('checked', true);
          });
        }, 1000);

        this.listarCategorias(this.informacionForm.value.tipo_inventario, true);
        $(document).trigger("enhance.tablesaw");

        // this.construirtabla();

      }), takeUntil(this.Unsuscribe)).subscribe({
        next: (res) => {
          if (res.visibleonline_producto === 1) {
            res.visibleonline_producto = true;
          } else {
            res.visibleonline_producto = false;
          }
          this.informacionForm.get('id_producto')?.setValue(res.id_producto);
          this.informacionForm.get('codigo_producto')?.setValue(res.codigo_producto);
          this.informacionForm.get('tipo_inventario')?.setValue(res.id_tipo_inventario);
          this.informacionForm.get('visible_tienda')?.setValue(res.visibleonline_producto);

          this.informacionForm.get('descripcion_corta')?.setValue(res.detalle_producto);
          this.informacionForm.get('descripcion_extendida')?.setValue(res.detallelargo_producto);

          this.descripcion_corta.setValue(res.detalle_producto);
          this.descripcion_extendida.setValue(res.detallelargo_producto);

          this.informacionForm.get('glosa_producto')?.setValue(res.glosa_producto);
          this.PrecioStockForm.get('precio_venta')?.setValue(res.precioventa_producto);
          this.PrecioStockForm.get('stock')?.setValue(res.stock_producto);
          this.PrecioStockForm.get('precio_costo')?.setValue(res.preciocosto_producto);
          this.checked_atributo = res.arreglo_atributo_producto;
          res.arreglo_color.forEach((element: any) => {
            let color = `
            <div class="row">
            <div class="col-md-4">
                        <div class="form-group">
                            <input type="color" class="form-control color" value='${element.hexadecimal_producto_color}' />
                        </div>
                    </div>
                      <div class="col-md-4">
                          <input input="text"  class="form-control nombrecolor" value='${element.nombre_producto_color}' />
                      </div>
                      <div class="col-md-2 text-center">
                          <i class="mdi mdi-delete-circle EliminarColumnas"
                              style="font-size:2rem;color: red;cursor:pointer;"></i>
                      </div>
                      </div>`;
            $(".color_agregar").append(color);
          });
          let html_body = '';
          res.arreglo_especificacion.forEach((element: any, i: any) => {
            html_body += `<tr>
            <td> <input  class="form-control nombre"  type="text" value="${element.glosa_especificaciones_producto}"></td>
            <td><input class="form-control descripcion"  type="text" value="${element.respuesta_especificaciones_producto}"></td>
                <td>
                    <button type="button"
                        class="btn btn-danger eliminar_especificacion"
                        data-toggle="tooltip"
                        data-original-title="Eliminar"><i class="fa fa-times-rectangle"></i></button>
                </td>
            </tr>`;
          });

          res.arreglo_categoria_producto.forEach((element: any) => {
            this.checked_categoria.push(element.id_categoria);
          });
          $("#tbody").append(html_body);

          this.imagenes_producto = res.arreglo_imagen;

          // this.listarProductoRelacionados = res.arreglo_relacionado;

          res.arreglo_relacionado.forEach((element: any) => {
            var indice = this.listaProductosRelacionado.findIndex((item: any) => item.id_producto === element.id_producto);
            if (indice > -1) {
              this.listaProductosRelacionado.splice(indice, 1);
            }
          });


        },
        error: (error) => {
          alert("error");
          console.log("error", error);
        }
      });
      // this.producto_serv;
    });


    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });

    this.servicio_categoria.Inventario(this.token).pipe(finalize(() => {
      $("#t-crear-categoria").children("div").remove();
      var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto; display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
      $("#t-crear-categoria").html(estructura_html);
    })).subscribe(
      {
        next: (res) => {
          this.tipo_inventario = res;

        }, error: (error) => {

        }
      }
    )


    $(document).on("keyup", ".posicion", (elemento: any) => {
      this.imagenes_producto[$(elemento.target).attr("id_posicion")].orden_imagen = $(elemento.target).val();
    })
    $(document).on("click", ".EliminarColumnas", ($evento: any) => {
      let div = $evento.target.parentElement.parentElement;
      div.remove();
    })
    $(function () {
      $(document).trigger("enhance.tablesaw");
    });
    $(document).on("keyup", ".nombre", (elemento: any) => {
      var escrito = elemento.target.value;
      if (escrito != '') {
        $(elemento.target).removeClass('is-invalid');
      } else {
        $(elemento.target).addClass('is-invalid');
      }
    })
    $(document).on("keyup", ".descripcion", (elemento: any) => {
      var escrito = $(elemento.target).val();
      if (escrito !== '') {
        $(elemento.target).removeClass('is-invalid');
      } else {
        $(elemento.target).addClass('is-invalid');
      }
    })


    // this.listarAtributo();

    $(document).on("click", "input[name='atributo_padre']", (elemento: any) => {
      //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
      if ($(elemento.target).is(':checked')) {
        let dato: any = {
          glosa_atributo: elemento.target.nextElementSibling.nextElementSibling.textContent,
          id_atributo: elemento.target.value,
          cantidad: 0
        }
        this.checked_atributo.push(dato);
      } else {
        this.producto_serv.removeItemFromArr(this.checked_atributo, elemento.target.value)
      }
      // $(".selector-atributo").prop("checked", false);
      // $("input[name='atributo_padre']").prop("checked", false);
      // this.checked_atributo.forEach((element: any) => {
      //   $(`#${element.id_atributo}`).prop('checked', true);
      // });
    })

    $(document).on("click", ".eliminar_especificacion", (elemento: any) => {
      $(elemento.target).closest('tr').remove();
    })

    $(document).on("click", "input[name='categoria_padre']", (elemento: any) => {
      //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
      if ($(elemento.target).is(':checked')) {
        this.checked_categoria.push(elemento.target.value);
      } else {
        this.producto_serv.removeItemFromArr(this.checked_categoria, elemento.target.value)
      }
      // $(".selector-categoria").prop("checked", false);
      // $("input[name='atributo_padre']").prop("checked", false);
      // this.checked_categoria.forEach((element: any) => {
      //   $(`#${element}`).prop('checked', true);
      // });
    })




  }





  AgregarColor() {
    let color = `
    <div class="row">
    <div class="col-md-4">
                <div class="form-group">
                    <input type="color" class="form-control color" />
                </div>
            </div>
              <div class="col-md-4">
                  <input input="text"  class="form-control nombrecolor" />
              </div>
              <div class="col-md-2 text-center">
                  <i class="mdi mdi-delete-circle EliminarColumnas"
                      style="font-size:2rem;color: red;cursor:pointer;"></i>

              </div>
              </div>`;
    $(".color_agregar").append(color);
  }

  listarCategorias(valor_inventario: any, listarinicio = false) {
    let id_inventario;
    if (listarinicio) {
      id_inventario = valor_inventario;
    } else {
      id_inventario = valor_inventario.value;
    }
    this.servicio_categoria.CargarCategoria(this.token, id_inventario).pipe(finalize(() => {
    })).subscribe(
      {
        next: (arreglo) => {
          var html = "";
          var vacio = "";
          if (arreglo.categoria == null) {
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
          } else {
            $.each(arreglo.categoria, (i: any, data: any) => {
              html += "<li><i class=\"fa fa-minus\"></i>";
              html += `<label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}_categoria" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
              if (typeof data.subcategoria !== 'undefined') {
                html += this.arbolSubcategoria(data.subcategoria);
              } else {
                html += "<h6 hidden class='marcador-subcategoria' >Subcategoria</h6>";
              }
              html += "</li>";
            });
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
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
        <label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}_categoria" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
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

  listarAtributo() {
    this.servicio_atributo.CargarAtributo(this.token).pipe(takeUntil(this.Unsuscribe)).subscribe(
      {
        next: (arreglo) => {
          var html = "";
          var vacio = "";
          if (arreglo.atributo == null) {
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" ><ul style='list-style: none;' id=\"treeview_atributo\" class=\"hummingbird-base\"></ul></div></div>";
          } else {
            $.each(arreglo.atributo, (i: any, data: any) => {
              html += "<li><i class=\"fa fa-minus\"></i>";
              html += `
            <label  class="inline custom-control custom-checkbox block label-desactivado"><input  id="${data.id_atributo}_atributo" value=${data.id_atributo} name='atributo_padre' type="checkbox"  class="custom-control-input selector-atributo desactivado" >
            <span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
              if (typeof data.subatributo !== 'undefined') {
                html += this.arbolSubatributo(data.subatributo);
              } else {
                html += "<h6 hidden class='marcador-subatributo' >SubAtributo</h6>";
              }
              html += "</li>";
            });
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" ><ul style='list-style: none;' id=\"treeview_atributo\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
          }
          $("#atributo-producto").html(estructura_html);
          $("#treeview_atributo").hummingbird();
          // var $checks = $('input[name="atributo_padre[]"]');
          // $checks.click(()=>{
          //     $checks.not(this).prop("checked", false);
          // });
        }, error: (error) => {

        }
      }
    )
  }

  arbolSubatributo(subatributo: any) {
    var html = "";
    html += "<ul style='display:block;list-style: none;' >";
    if (typeof subatributo !== 'undefined') {
      $.each(subatributo, (i: any, data: any) => {
        html += `<li><i class='fa fa-minus'></i> 
        <label  class="inline custom-control custom-checkbox block"><input id="${data.id_atributo}_atributo" value=${data.id_atributo} name='atributo_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-atributo" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
        if (typeof data.subatributo !== 'undefined') {
          html += this.arbolSubatributo(data.subatributo);
        } else {
          html += "<h6  hidden class='marcador-subcategoria-hijo'>Subcategoria hijo</h6>";
        }
        html += "</li>";

      });
    };
    html += "</ul>";
    return html;
  }


  levantarmodalimagenes() {
    var drDestroy = $('.dropify').dropify({
      messages: {
        default: 'Arrastre y suelte un archivo aquí o haga clic en',
        replace: 'Arrastre y suelte un archivo o haga clic para reemplazar',
        remove: 'Eliminar',
        error: 'Lo siento, el archivo es demasiado grande.'
      }
    });
    $("#modal-imagenes").modal('show');
  }

  GuardarImagenes() {
    let filesSelected = document.getElementById("input-file-now").files;
    let nombre_imagen = $("#nombre_imagen").val();
    filesSelected = filesSelected;
    if (filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];
      var fileReader = new FileReader();
      fileReader.onload = (fileLoadedEvent: any) => {
        let srcData = fileLoadedEvent.target.result; // <--- data: base64
        var newImage = document.createElement('img');
        newImage.src = srcData;
        let datoimagen = {
          id_producto_imagen: null,
          imagen: srcData,
          nombre_imagen: nombre_imagen,
          orden_imagen: this.imagenes_producto.length + 1,
          portada: false
        };
        this.imagenes_producto.push(datoimagen);
        $(document).trigger("enhance.tablesaw");
        // this.construirtabla();
      }
      fileReader.readAsDataURL(fileToLoad);
      // setTimeout(() => {
      //   this.construirtabla();
      // }, 1000);
    }
    $("#nombre_imagen").val('');
    $(".dropify-clear").click();


  }

  construirtabla() {
    let tr = '';
    console.log(this.imagenes_producto);
    this.imagenes_producto.forEach((item: any, i: any) => {
      let checked = '';
      if (item.portada) {
        checked = 'checked';
      }
      tr += `<tr>
      <td>${item.nombre_imagen}</td>
        <td>
            <div class="card">
                <div class="card-body">
                    <span
                        class="mytooltip tooltip-effect-1">
                        <img src="${item.imagen}"
                            class="tooltip-item" alt="user"
                            width="100" />
                        <span
                            class="tooltip-content clearfix text-center">
                            <img src="${item.imagen}"
                                alt="euclid" /><span
                                class="tooltip-text"></span>
                        </span>
                    </span>
                </div>
            </div>
        </td>
        <td><input type='text' class="form-control form-control-sm posicion" id_posicion=${i} value=${item.orden_imagen}></input> </td>
        <td> <label class="inline custom-control custom-checkbox block">
                <input type="checkbox"
                        name="agregar_imagen_edit"
                        class="custom-control-input agregar_imagen_edit"
                        value="${i}" ${checked}>
                <span
                    class="custom-control-indicator"></span>
                <span
                    class="custom-control-description ml-0"></span>
            </label>
        </td>
        <td id_imagen=${i}>
            <button type="button"
                class="btn btn-danger eliminar_imagen"
                data-toggle="tooltip"
                data-original-title="Eliminar"><i class="fa fa-times-rectangle"></i></button>
        </td>
        </tr>`;
    });
    $(".agregar_imagen_edit").html(`<table class="tablesaw table-bordered table-hover table" data-tablesaw-mode="swipe">
        <thead>
            <tr>
                <th scope="col" data-tablesaw-sortable-col
                data-tablesaw-priority="persist">Titulo</th>
                <th scope="col" data-tablesaw-sortable-col
                data-tablesaw-priority="1">Imagen</th>
                <th scope="col" data-tablesaw-sortable-col
                data-tablesaw-priority="2">Posición
                </th>
                <th scope="col" data-tablesaw-sortable-col
                data-tablesaw-priority="3">Portada</th>
                <th scope="col" data-tablesaw-sortable-col
                data-tablesaw-priority="4">Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${tr}
        </tbody>
     </table>`)
    $(document).trigger("enhance.tablesaw");
  }

  ActivarPortada(indice: any, elemento: any) {
    if ($(elemento.target).is(':checked')) {
      $(".agregar_imagen_edit").prop("disabled", true);
      $(elemento.target).prop("disabled", false);
      this.imagenes_producto[indice].portada = true;
    } else {
      this.imagenes_producto[indice].portada = false;
      $(".agregar_imagen_edit").prop("disabled", false);
    }
  }
  EliminarImagen(indice: any) {
    this.imagenes_producto = this.imagenes_producto.filter((item: any, indices: any) => {
      if (indices != indice)
        return item;
    });
  }

  AgregarInputtabla(): any {
    var tr_ultimo = $('table tr:last');
    let td1 = $(tr_ultimo).children()[0];
    let td2 = $(tr_ultimo).children()[1];
    console.log($(td1).find("input").val());
    if ($(td1).find("input").val() == '' || $(td2).find("input").val() == '') {
      if ($(td1).find("input").val() == '') {
        $(td1).find("input").addClass('is-invalid');
      } else {
        $(td1).find("input").removeClass('is-invalid');

      }
      if ($(td2).find("input").val() == '') {
        $(td2).find("input").addClass('is-invalid');
      } else {
        $(td2).find("input").removeClass('is-invalid');

      }
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: 'Ingrese el valor en la fila porfavor.',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      return false;
    }
    $("#tbody").append(`<tr>
    <td> <input  class="form-control nombre"  type="text" value=""></td>
    <td><input class="form-control descripcion"  type="text" value=""></td>
    <td>
        <button type="button"
        class="btn btn-danger eliminar_especificacion"
        data-toggle="tooltip"
        data-original-title="Eliminar"><i class="fa fa-times-rectangle"></i></button>
    </td>
    </tr>`);
  }


  BuscarProductoRelaciondo(id_producto: any): any {
    this.producto_serv.TraerProductosID(id_producto, this.token).pipe(finalize(() => {
      var indice = this.listaProductosRelacionado.findIndex((item: any) => item.id_producto === id_producto);
      if (indice > -1) {
        this.listaProductosRelacionado.splice(indice, 1);
      }
      this.producto_relacionado = '';

    }), takeUntil(this.Unsuscribe)).subscribe(
      {
        next: resp => {

          this.listarProductoRelacionados.push(resp)

        },
        error: error => {
          console.log(error);

        }
      }
    )


  }

  RecuperarProductoRelacionado(producto: any) {
    var indice = this.listarProductoRelacionados.findIndex((item: any) => item.id_producto === producto.id_producto);;
    if (indice > -1) {
      this.listarProductoRelacionados.splice(indice, 1);
    }
    this.listaProductosRelacionado.push(producto);
  }


  GuardarProductoCompleto() {
    //  ROPA COLOR

    var color = document.getElementsByClassName("color");
    var nombrecolor = $(".nombrecolor");
    color = [].slice.call(color);
    nombrecolor = nombrecolor.toArray();
    var coloresHexadecimal = [];
    for (let index = 0; index < color.length; index++) {
      let datos_colores = {
        nombre_color: nombrecolor[index].value,
        color_hexadecimal: color[index].value
      }
      coloresHexadecimal.push(datos_colores);

      if (nombrecolor[index].value == "") {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'Completar el nombre del color de la ropa.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
        return;
      }
    }

    //

    //ESPECIFICACIONES
    let especificaciones: any = [];
    document.querySelectorAll('#tabla_especificaciones tbody tr').forEach(function (e: any) {
      let consult = {
        nombre: e.querySelector('.nombre').value,
        descripcion: e.querySelector('.descripcion').value,
      };
      especificaciones.push(consult);
    });


    //
    this.informacionForm.markAllAsTouched()
    this.PrecioStockForm.markAllAsTouched()
    if (this.informacionForm.invalid || this.PrecioStockForm.invalid) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: 'Completar los campos obligatorios.',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      return;
    }

    //CATEGORIAS SELECCIONADOS----------------------------
    let valorescategoria: any = [];
    $("input[name=categoria_padre]:checked").each(function (index: any, check: any) {
      valorescategoria.push(check.value);
    });
    //---------------------------------------------------

    //VERIFICAMOS SI TIENES ATRIBUTO SELECCIONADO------------
    if (this.checked_atributo.length > 0) {
      let cantidad = 0;
      this.checked_atributo.forEach((element: any) => {
        cantidad += element.cantidad;
      });
      if (cantidad > this.PrecioStockForm.value.stock) {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'La cantidad de los atributos no puede ser mayor al stock del producto.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
        return;
      }
    };

    this.buttonDisabled = true;
    this.informacionForm.get('descripcion_corta')!.setValue(this.descripcion_corta.getValue());
    this.informacionForm.get('descripcion_extendida')!.setValue(this.descripcion_extendida.getValue());
    this.producto_serv.GuardarProductoActualizar(this.token, valorescategoria, this.informacionForm.value, this.PrecioStockForm.value, this.imagenes_producto, coloresHexadecimal, especificaciones, this.listarProductoRelacionados, this.checked_atributo).
      subscribe({
        next: (res) => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: 'Producto actualizado con exito.',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })
          this.router.navigateByUrl("/Producto").then();
        },
        error: (error) => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'error',
            title: 'Error.',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })
          this.buttonDisabled = true;

        }
      })
  }

  GuardarCantidadAtributo(evento: any, id_atributo: any) {
    let cantidad = parseInt(evento.value);
    if (cantidad < 0) {
      cantidad = 0;
    }
    this.checked_atributo.forEach((element: any) => {
      if (element.id_atributo == id_atributo) {
        element.cantidad = cantidad;
      }
    });
    console.log(this.checked_atributo);
  }

  VerificarSku(event: any) {
    let codigo = event.target.value;
    clearTimeout(this.contador_texto); // <--- The solution is here
    this.contador_texto = setTimeout(() => {
      this.producto_serv.VerificarSku(this.token, codigo, this.informacionForm.value.id_producto).subscribe(res => {
        event.target.classList.add('is-valid');
        event.target.classList.remove('is-invalid');
        this.verificador_sku = false;
      }, error => {
        event.target.classList.add('is-invalid');
        event.target.classList.remove('is-valid');
        this.verificador_sku = true;
      });
    }, 700);
  }


}

