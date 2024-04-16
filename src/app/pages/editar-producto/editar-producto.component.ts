import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CategoriaService } from '../../services/categoria.service';
import { LoginService } from '../../services/login.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ProductoService } from '../../services/producto.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AtributoService } from '../../services/atributo.service';
import { Atributo_seleccionado } from 'src/app/interface/Datatable';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalMarcaComponent } from '../modals/modal-marca/modal-marca.component';
import { ToastrService } from 'ngx-toastr';
import { HelpersService } from 'src/app/services/helpers.service';
import { QuillViewComponent } from 'ngx-quill';
declare var $: any;
declare var document: any;
declare var Swal: any;


@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css']
})
export class EditarProductoComponent implements OnInit, OnDestroy {
  @ViewChild('hijomodalmarca') hijomodalmarca: ModalMarcaComponent | any;
  @ViewChild('productoSelect') productoSelect: any;
  @ViewChild('descripcion_extendida') descripcion_extendida?: QuillViewComponent;
  @ViewChild('descripcion_corta') descripcion_corta?: QuillViewComponent;

  token: any;
  tipo_inventario?: any = [];
  imagenes_producto?: any = [];
  listaProductosRelacionado: any = [];
  glosa_global_producto: any;
  path_global_producto: any;
  listarProductoRelacionados: any = [];
  informacionForm!: FormGroup;
  PrecioStockForm!: FormGroup;
  checked_atributo: Atributo_seleccionado[] = [];
  checked_categoria: any = [];
  tipo_afectacion: any = [];
  color: any;
  contador_texto: any;
  verificador_sku: boolean = false;
  Unsuscribe: any = new Subject();
  isLoading: boolean = false;
  marcas: any[] = [];
  texto_cabezera: string = '';
  arregloEspecificacion: any[] = [];
  arregloColor: any[] = [];
  id_tipo_inventario: any = null
  arregloFormaFarmaceutica: any[] = [];
  arregloTipoConcentracion: any[] = [];
  arregloBodegas: any[] = [];
  GuardarInformacion: boolean = false;
  rol: boolean = true;
  usuario: any = null;
  modulesQuill: any;
  private res: any; // Propiedad para almacenar el valor de res
  constructor(
    private servicio_categoria: CategoriaService,
    private servicio_login: LoginService,
    private producto_serv: ProductoService,
    private servicio_atributo: AtributoService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private el: ElementRef,
    private helper: HelpersService
  ) {
    this.modulesQuill = this.helper.getToolbarConfig();
    this.token = this.servicio_login.getToken();
    this.usuario = this.servicio_login.getIdentity();
    if (this.usuario && this.usuario.id_perfil == 1) {//SOLO PARA LOS ADMINISTRADORES
      this.rol = false;
    }
    this.informacionForm = this.fb.group({
      id_producto: ['', [Validators.required]],
      codigo_producto: ['', [Validators.required]],
      tipo_inventario: ['', [Validators.required]],
      visible_tienda: [false],
      descripcion_corta: [],
      descripcion_extendida: [],
      glosa_producto: ['', [Validators.required]],
      id_tipo_afectacion: [''],
      codigo_barra_producto: [''],
      id_marca: [''],
      id_unidad: [''],
      id_tipo_concentracion: [''],
    });
    this.PrecioStockForm = this.fb.group({
      stock: [[]]
    });

    this.listarAtributo();
    this.route.data.pipe(takeUntil(this.Unsuscribe), finalize(() => {
    })).subscribe((respuesta: any) => {
      this.res = respuesta.datos.producto;
      this.arregloFormaFarmaceutica = respuesta.datos.unidad;
      this.arregloTipoConcentracion = respuesta.datos.tipo_concentracion;
      this.tipo_inventario = respuesta.datos.tipo_inventario;
      this.tipo_afectacion = this.res.tipoAfectacion;
      if (this.res.visibleonline_producto === 1) {
        this.res.visibleonline_producto = true;
      } else {
        this.res.visibleonline_producto = false;
      }
      this.informacionForm.get('id_producto')?.setValue(this.res.id_producto);
      this.informacionForm.get('id_unidad')?.setValue(`${this.res.id_unidad ?? ''}`);
      this.informacionForm.get('id_tipo_concentracion')?.setValue(`${this.res.id_tipo_concentracion ?? ''}`);
      this.informacionForm.get('codigo_producto')?.setValue(this.res.codigo_producto);
      this.informacionForm.get('tipo_inventario')?.setValue(this.res.id_tipo_inventario);
      this.informacionForm.get('visible_tienda')?.setValue(this.res.visibleonline_producto);
      this.informacionForm.get('id_tipo_afectacion')?.setValue(this.res.id_tipo_afectacion);
      this.informacionForm.get('codigo_barra_producto')?.setValue(this.res.codigo_barra_producto);
      this.informacionForm.get('glosa_producto')?.setValue(this.res.glosa_producto);
      this.informacionForm.get('descripcion_corta')?.setValue(this.res.detalle_producto);
      this.informacionForm.get('descripcion_extendida')?.setValue(this.res.detallelargo_producto);
      this.marcas = [{
        id_marca: this.res.id_marca,
        glosa_marca: this.res.glosa_marca
      }];
      this.informacionForm.get('id_marca')?.setValue(this.res.id_marca);
      this.arregloColor = this.res.arreglo_color;
      this.arregloEspecificacion = this.res.arreglo_especificacion;
      this.imagenes_producto = this.res.arreglo_imagen;
      this.listarProductoRelacionados = this.res.arreglo_relacionado;
      this.arregloBodegas = this.res.stock_producto_bodega;
      $(document).trigger("enhance.tablesaw");
    })
  }
  ngOnDestroy(): void {
    this.Unsuscribe.unsubscribe();
  }
  ngAfterViewInit(): void {
    // TERMINA SU EJECUCION CON NGAFTERVIEWINIT-----------------------------------
    // Configuración de Quill
    const descripcion_corta: any = this.descripcion_corta?.quillEditor;
    const descripcion_extendida: any = this.descripcion_extendida?.quillEditor;
    if (descripcion_corta) {
      descripcion_corta.clipboard.dangerouslyPasteHTML(this.res.detalle_producto);
    }
    if (descripcion_extendida) {
      descripcion_extendida.clipboard.dangerouslyPasteHTML(this.res.detallelargo_producto);
    }
    // --------------------------------------------------------------------------------------
    $("#t-editar-categoria-producto").children("div").remove();
    var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto; display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
    $("#t-editar-categoria-producto").html(estructura_html);
    setTimeout(() => {
      this.checked_atributo.forEach((element: any) => {
        const checkbox = document.getElementById(`${element.id_atributo}_atributo`) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
        }
      });

      this.checked_categoria.forEach((element: any) => {
        const checkbox = document.getElementById(`${element}_categoria`) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }, 1500);
    //----------------------------------------------------------------------------
  }
  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
    // PRIMERO SE INICIALIZA CON NGINIT EL COMPONENTE
    this.listarCategorias(this.res.id_tipo_inventario, true);
    this.checked_atributo = this.res.arreglo_atributo_producto;
    this.checked_categoria = this.res.arreglo_categoria_producto.map((element: any) => element.id_categoria);
    // ------------------------------------------------------------------------------------------
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

    $(document).on("click", ".eliminar_especificacion", (elemento: any) => {
      $(elemento.target).closest('tr').remove();
    })

    // $(document).on("click", "input[name='categoria_padre']", (elemento: any) => {
    //   //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
    //   if ($(elemento.target).is(':checked')) {
    //     this.checked_categoria.push(elemento.target.value);
    //   } else {
    //     this.producto_serv.removeItemFromArr(this.checked_categoria, elemento.target.value)
    //   }

    // })




  }





  AgregarColor() {
    this.arregloColor.push({
      id_producto_color: null,
      hexadecimal_producto_color: '',
      nombre_producto_color: ''
    });

  }

  listarCategorias(valor_inventario: any, listarinicio = false) {
    if (listarinicio) {
      this.id_tipo_inventario = valor_inventario;
    } else {
      this.id_tipo_inventario = valor_inventario.value;
    }
    this.servicio_categoria.CargarCategoria(this.token, this.id_tipo_inventario).pipe(finalize(() => {
    })).subscribe(
      {
        next: (arreglo) => {
          var html = "";
          if (arreglo.categoria == null) {
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
          } else {
            $.each(arreglo.categoria, (i: any, data: any) => {
              html += "<li class='categoria-item'><i class=\"fa fa-plus\"></i>";
              html += `<label style="pointer-events: none;" class="inline custom-control custom-checkbox block"><input id="${data.id_categoria}_categoria" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input" ><span  class="custom-control-indicator"></span><span class="custom-control-description ml-0"> ${data.glosa_categoria}</span></label>`;
              if (typeof data.subcategoria !== 'undefined') {
                html += this.arbolSubcategoria(data.subcategoria);
              } else {
                html += "<h6 hidden class='marcador-subcategoria' >Subcategoria</h6>";
              }
              html += "</li>";
            });
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto;  display: block;overflow: auto\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
          }
          $("#t-editar-categoria-producto").html(estructura_html);
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
    var html = "<ul style='list-style: none; display: none;'>"; // Añade display: none para ocultar las subcategorías inicialmente
    if (typeof subcategoria !== 'undefined') {
      $.each(subcategoria, (i: any, data: any) => {
        var tieneSubcategoria = typeof data.subcategoria !== 'undefined';
        var estilo = tieneSubcategoria ? 'style="pointer-events: none;"' : ''; // Aplicar el estilo solo si tiene subcategorías
        html += `<li class='categoria-item'><i class='fa ${tieneSubcategoria ? "fa-plus" : "fa-minus"}'></i>
          <label ${estilo} class="inline custom-control custom-checkbox block">
            <input id="${data.id_categoria}_categoria" value=${data.id_categoria} name='categoria_padre' type="checkbox" formcontrolname="visible_tienda" class="custom-control-input" ${tieneSubcategoria ? "disabled" : ""}>
            <span class="custom-control-indicator"></span>
            <span class="custom-control-description ml-0">${data.glosa_categoria}</span>
          </label>`;
        if (tieneSubcategoria) {
          html += this.arbolSubcategoria(data.subcategoria);
        } else {
          html += "<h6 hidden class='marcador-subcategoria-hijo'>Subcategoria hijo</h6>";
        }
        html += "</li>";
      });
    }
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
    $('.dropify').dropify({
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
      }
      fileReader.readAsDataURL(fileToLoad);

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
  EliminarColumnascolor(indice: any) {
    this.arregloColor = this.arregloColor.filter((item: any, indices: any) => {
      if (indices != indice)
        return item;
    });
  }

  AgregarInputtabla(): any {
    this.arregloEspecificacion.push({
      id_especificaciones_producto: null,
      glosa_especificaciones_producto: '',
      respuesta_especificaciones_producto: ''
    });
  }

  eliminarFila(index: number) {
    this.arregloEspecificacion.splice(index, 1);
  }
  BuscarProductoRelaciondo(data: any): any {
    if (data && data.id_producto) {
      this.producto_serv.TraerProductoIdRelacionado(data.id_producto).pipe(finalize(() => {
        this.limpiarSeleccion('producto-relacionado');
        this.productoSelect.clearModel();
      }), takeUntil(this.Unsuscribe)).subscribe(
        {
          next: resp => {
            this.listarProductoRelacionados.push(resp)
          },
          error: error => {
            this.toastr.success(`Error al seleccionar el producto.`, undefined, {
              timeOut: 3000,
              positionClass: 'toast-top-right',
            });
          }
        }
      )
    }
  }
  RecuperarProductoRelacionado(producto: any) {
    var indice = this.listarProductoRelacionados.findIndex((item: any) => item.id_producto === producto.id_producto);;
    if (indice > -1) {
      this.listarProductoRelacionados.splice(indice, 1);
    }
    this.listaProductosRelacionado.push(producto);
  }

  buscarMarca(term: string) {
    this.isLoading = true;
    if (term.length > 1) {
      this.producto_serv.BuscarMarca(term).pipe(takeUntil(this.Unsuscribe))
        .subscribe((data: any) => {
          this.marcas = data.map((item: any) => item);
          this.isLoading = false;
        });
    } else {
      this.limpiarSeleccion('marca');
      this.isLoading = false;
    }

  }
  limpiarSeleccion(tipo: string) {
    switch (tipo) {
      case 'marca':
        this.marcas = [];
        break;
      case 'producto-relacionado':
        this.listaProductosRelacionado = [];
        break;
      default:
        break;
    }
  }



  GuardarProductoCompleto() {
    this.informacionForm.markAllAsTouched()
    this.PrecioStockForm.get('stock')?.setValue(this.arregloBodegas);
    if (this.informacionForm.invalid) {
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

    this.GuardarInformacion = true;
    this.producto_serv.GuardarProductoActualizar(this.token, valorescategoria, this.informacionForm.value, this.PrecioStockForm.value, this.imagenes_producto, this.arregloColor, this.arregloEspecificacion, this.listarProductoRelacionados, this.checked_atributo).
      pipe(takeUntil(this.Unsuscribe), finalize(() => {
        this.GuardarInformacion = false;
      })).
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
          this.checked_atributo = res.arreglo_atributo_producto;
          this.imagenes_producto = res.arreglo_imagen;
          this.listarProductoRelacionados = res.arreglo_relacionado;
          this.arregloEspecificacion = res.arreglo_especificacion;
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

  SearchProductoRelacionado(term: string) {
    this.isLoading = true;
    let id_productos = this.listarProductoRelacionados.map((item: any) => item.id_producto);
    id_productos.push(this.informacionForm.value.id_producto)
    console.log(id_productos);
    if (term.length > 1) {
      this.producto_serv.BuscarProductoRelacionado(term, id_productos).pipe(takeUntil(this.Unsuscribe))
        .subscribe((data: any) => {
          this.listaProductosRelacionado = data.map((item: any) => ({
            glosa_producto: `${item.glosa_producto} (${item.codigo_producto})`,
            id_producto: item.id_producto,
          }));
          this.isLoading = false;
        });
    } else {
      this.limpiarSeleccion('producto-relacionado');
      this.isLoading = false;
    }
  }


  manejarRespuesta(respuesta: any) {
    console.log("PADRE", respuesta) // Manejar la respuesta aquí
    this.marcas = [respuesta];
    this.informacionForm.get('id_marca')?.setValue(respuesta.id_marca);
  }
  AbrirModal() {
    this.texto_cabezera = "CREAR MARCA";
    $('#exampleModalCenter').modal('show');
    let datos = {
      accion: 'CREAR',
      modulo: 'PRODUCTO'
    }
    this.hijomodalmarca.llamarFuncionHijoDesdePadre(datos);
  }

  onInput(event: any): void {
    const inputElement: any = event.target as HTMLInputElement;
    const valor = this.helper.validarNumeroDecimal(event);
    inputElement.value = valor;
  }

  InputChangeMayuscula(event: any,tipo:string) {
    let newValue = event.target.value.toUpperCase();
    switch (tipo) {
      case 'SKU':
        this.informacionForm.controls['codigo_producto'].setValue(newValue);
        break;
    case 'CODIGO BARRA':
      this.informacionForm.controls['codigo_barra_producto'].setValue(newValue);
      break;
      default:
        this.informacionForm.controls['glosa_producto'].setValue(newValue);
        break;
    }
}


}

