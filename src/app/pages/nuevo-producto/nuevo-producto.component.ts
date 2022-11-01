import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { LoginService } from '../../services/login.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ProductoService } from '../../services/producto.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AtributoService } from '../../services/atributo.service';
import { Atributo_seleccionado } from 'src/app/interface/Datatable';
import { Router } from '@angular/router';
declare var $: any;
declare var document: any;
declare var Swal: any;

@Component({
  selector: 'app-nuevo-producto',
  templateUrl: './nuevo-producto.component.html',
  styleUrls: ['./nuevo-producto.component.css']
})
export class NuevoProductoComponent implements OnInit, OnDestroy {
  @ViewChild('codigo_producto') codigo_producto?: ElementRef;
  token: any;
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
  contador_texto: any;
  verificador_sku: boolean = false;
  Unsuscribe: any = new Subject();
  color: any;
  constructor(
    private servicio_categoria: CategoriaService,
    private servicio_login: LoginService,
    private producto_serv: ProductoService,
    private servicio_atributo: AtributoService,
    private fb: FormBuilder,
    private router: Router,

  ) { }

  ngOnDestroy(): void {
    this.Unsuscribe.unsubscribe();
  }

  ngOnInit(): void {
    this.descripcion_extendida = $('.descripcion_extendida').wysihtml5().data('wysihtml5').editor;
    this.descripcion_corta = $('.descripcion_corta').wysihtml5().data('wysihtml5').editor;

    this.token = this.servicio_login.getToken();
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });


    var form = $(".validation-wizard").show();
    $(".validation-wizard").steps({
      headerTag: "h6"
      , bodyTag: "section"
      , transitionEffect: "fade"
      , titleTemplate: '<span class="step">#index#</span> #title#',
      autoFocus: true,
      enableFinishButton: true,
      reset: true
      , labels: {
        finish: "Guardar",
        next: "Siguiente",
        previous: "Atras",
        loading: "Cargando ..."
      }
      , onStepChanging: function (event: any, currentIndex: number, newIndex: string | number) {
        return currentIndex > newIndex || !(3 === newIndex && Number($("#age-2").val()) < 18) && (currentIndex < newIndex && (form.find(".body:eq(" + newIndex + ") label.error").remove(), form.find(".body:eq(" + newIndex + ") .error").removeClass("error")), form.validate().settings.ignore = ":disabled,:hidden", form.valid())
      }
      , onFinishing: function (event: any, currentIndex: any) {
        return form.validate().settings.ignore = ":disabled", form.valid()
      }
      , onFinished: function (event: any, currentIndex: any) {
        // swal("Form Submitted!", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lorem erat eleifend ex semper, lobortis purus sed.");
        $(".validation-wizard").hide();
      }
    }), $(".validation-wizard").validate({
      ignore: "input[type=hidden]"
      , errorClass: "text-danger"
      , successClass: "text-success"
      , highlight: function (element: any, errorClass: any) {
        $(element).removeClass(errorClass)
      }
      , unhighlight: function (element: any, errorClass: any) {
        $(element).removeClass(errorClass)
      }
      , errorPlacement: function (error: { insertAfter: (arg0: any) => void; }, element: any) {
        error.insertAfter(element)
      }
      , rules: {
        email: {
          required: true
        }
      },
      messages: {
        correo: 'Este campo es requerido',
        email: {
          required: 'Este campo es requerido',
          equalTo: 'El correo no coincide'
        },
      }
    })

    this.servicio_categoria.Inventario(this.token).pipe(finalize(() => {
      $("#t-crear-categoria").children("div").remove();
      var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
      $("#t-crear-categoria").html(estructura_html);
    })).subscribe(
      {
        next: (res) => {
          this.tipo_inventario = res;

        }, error: (error) => {

        }
      }
    )
    $(document).on("click", "input[name='agregar_imagen']", (elemento: any) => {
      let cantidad = 0;
      $("input[name='agregar_imagen']:checked").each((i: any, elemento: any) => {
        cantidad++;
      });
      if (cantidad < 2 && cantidad >= 0) {
        if ($(elemento.target).is(':checked')) {
          $(".agregar_imagen").prop("disabled", true);
          $(elemento.target).prop("disabled", false);
          this.imagenes_producto[$(elemento.target).attr("value")].portada = true;
          console.log(this.imagenes_producto);
        } else {
          this.imagenes_producto[$(elemento.target).attr("value")].portada = false;
          $(".agregar_imagen").prop("disabled", false);
        }
      } else {
        $(elemento.target).prop("disabled", true);
        $(elemento.target).prop("checked", false);
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: 'Ya tiene seleccionado 1 imagen de portada.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }

    })
    $(document).on("click", ".eliminar_imagen", (elemento: any) => {
      this.imagenes_producto.splice($(elemento.target).attr("id_imagen"), 1);
      this.construirtabla();
    })
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
    this.producto_serv.ListaProductosRelacionado(this.token, this.producto_relacionado).pipe(takeUntil(this.Unsuscribe)).subscribe({
      next: resp => {
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
    this.informacionForm = this.fb.group({
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
    this.listarAtributo();

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
      
    })

    $(document).on("click", "input[name='categoria_padre']", (elemento: any) => {
      //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
      if ($(elemento.target).is(':checked')) {
        this.checked_categoria.push(elemento.target.value);
      } else {
        this.producto_serv.removeItemFromArr(this.checked_categoria, elemento.target.value)
      }
     
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

  listarCategorias(valor_inventario: any) {
    this.servicio_categoria.CargarCategoria(this.token, valor_inventario.value).pipe(finalize(() => {
    })).subscribe(
      {
        next: (arreglo) => {
          var html = "";
          var vacio = "";
          if (arreglo.categoria == null) {
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
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
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
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
        <label  class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-categoria" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
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
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 25vh;  display: block;\"><ul style='list-style: none;' id=\"treeview_atributo\" class=\"hummingbird-base\"></ul></div></div>";
          } else {
            $.each(arreglo.atributo, (i: any, data: any) => {
              html += "<li><i class=\"fa fa-minus\"></i>";
              html += `
            <label  class="inline custom-control custom-checkbox block label-desactivado"><input  id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox"  class="custom-control-input selector-atributo desactivado" >
            <span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
              if (typeof data.subatributo !== 'undefined') {
                html += this.arbolSubatributo(data.subatributo);
              } else {
                html += "<h6 hidden class='marcador-subatributo' >SubAtributo</h6>";
              }
              html += "</li>";
            });
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Atributo Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: 25vh;  display: block;\"><ul style='list-style: none;' id=\"treeview_atributo\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
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
        <label  class="inline custom-control custom-checkbox block"><input id="${data.id_atributo}" value=${data.id_atributo} name='atributo_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input selector-atributo" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_atributo}</span></label>`;
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
          imagen: srcData,
          nombre_imagen: nombre_imagen,
          orden_imagen: this.imagenes_producto.length + 1,
          portada: false
        };
        this.imagenes_producto.push(datoimagen);
      }
      fileReader.readAsDataURL(fileToLoad);
      setTimeout(() => {
        this.construirtabla();
      }, 500);
    }
    $("#nombre_imagen").val('');
    $(".dropify-clear").click();
  }

  construirtabla() {
    let tr = '';
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
                        name="agregar_imagen"
                        class="custom-control-input agregar_imagen"
                        value="${i}" ${checked}>
                <span
                    class="custom-control-indicator"></span>
                <span
                    class="custom-control-description ml-0"></span>
            </label>
        </td>
        <td>
            <button type="button"
                class="btn btn-danger eliminar_imagen"
                id_imagen=${i}
                data-toggle="tooltip"
                data-original-title="Eliminar"><i class="fa fa-times-rectangle"></i></button>
        </td>
        </tr>`;
    });
    $(".agregar_imagen").html(`<table class="tablesaw table-bordered table-hover table" data-tablesaw-mode="swipe">
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
    </tr>`);
  }


  BuscarProductoRelaciondo(id_producto: any): any {
    this.producto_serv.TraerProductosID(id_producto, this.token).pipe(finalize(() => {
      var indice = this.listaProductosRelacionado.findIndex((item: any) => item.id_producto === id_producto);;
      if (indice > -1) {
        this.listaProductosRelacionado.splice(indice, 1);
      }
      this.producto_relacionado = '';

    })).subscribe(
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

    if (this.verificador_sku) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: 'El codigo del producto ya existe.',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      let elemento: any = this.codigo_producto?.nativeElement;
      elemento.classList.toggle('is-invalid');
      return;
    }
    //CATEGORIAS SELECCIONADOS
    let valorescategoria: any = [];
    $("input[name=categoria_padre]:checked").each(function (index: any, check: any) {
      valorescategoria.push(check.value);
    });
    //

    //VERIFICAMOS SI TIENES ATRIBUTO SELECCIONADO
    if (this.checked_atributo.length > 0) {
      let cantidad = 0;
      this.checked_atributo.forEach((element: any) => {
        cantidad += element.cantidad;
      });
      console.log(cantidad);
      console.log(this.PrecioStockForm.value.stock);
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
    this.informacionForm.get('descripcion_corta')!.setValue(this.descripcion_corta.getValue());
    this.informacionForm.get('descripcion_extendida')!.setValue(this.descripcion_extendida.getValue());
    this.producto_serv.GuardarProductoActualizar(this.token, valorescategoria, this.informacionForm.value, this.PrecioStockForm.value, this.imagenes_producto, coloresHexadecimal, especificaciones, this.listarProductoRelacionados, this.checked_atributo).
      subscribe({
        next: (res) => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: 'Producto creado con exito.',
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
  }

  VerificarSku(event: any) {
    let codigo = event.target.value;
    clearTimeout(this.contador_texto); // <--- The solution is here
    this.contador_texto = setTimeout(() => {
      this.producto_serv.VerificarSku(this.token, codigo,null).subscribe(res => {
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
