import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject, finalize } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';


declare var $: any;
declare var Swal: any;
class DataTablesResponse {
  data: any[] | undefined;
  draw: number | undefined;
  recordsFiltered: number | undefined;
  recordsTotal: number | undefined;
}


@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})


export class PedidosComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('cantidad') cantidad!: ElementRef;


  dtOptions: DataTables.Settings[] = [];
  reload_producto: any = new Subject();
  reload_producto_deshabilitado: any = new Subject();
  //Identificacion del usuario
  identity: any;
  token: any;
  listarProducto: any = [];
  listarProductoDeshabilitado: any = [];
  ProductoBuscar!: FormGroup;
  GestionarStock!: FormGroup;
  tipo_inventario?: any = [];
  color: any;
  Producto: any;
  tipo_movimiento: any = null;
  usuario: any = null;
  estado_pedido: any = [];
  estado_pago: any = [];
  estado_preparacion: any = [];
  constructor(private http: HttpClient,
    private servicio_login: LoginService,
    private fb: FormBuilder,
    private servicio_categoria: CategoriaService,
    private servicio_producto: ProductoService,
    private servicio_pedido: PedidoService,
  ) {
    this.usuario = servicio_login.getIdentity();
    this.ProductoBuscar = this.fb.group({
      filtrar_pedido: [""],
      estado_pedido: [""],
      estado_pago: [""],
      estado_preparacion: [""],
      id_tipo_inventario: [""]
    });
    this.GestionarStock = this.fb.group({
      accion: ['', [Validators.required]],
      precio_compra: [''],
      cantidad: ['', [Validators.required]],
      stock_final: [''],
      comentario: [''],
      id_usuario: [this.usuario.sub],
    });

  }
  ngOnInit(): void {
    this.token = this.servicio_login.getToken();
    this.ProductoHabilitados();
    this.ProductosDeshabilitados();
    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });

    this.servicio_categoria.Inventario(this.token).pipe(finalize(() => {
      $("#t-crear-categoria").children("div").remove();
      var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto; overflow-y: scroll; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
      $("#t-crear-categoria").html(estructura_html);
    })).subscribe(
      {
        next: (res) => {
          this.tipo_inventario = res;

        }, error: (error) => {

        }
      }
    )

    this.servicio_pedido.ListaProductosRelacionado(this.token).pipe(finalize(() => {
      $(function () {
        $('.selectpicker').selectpicker();
      });

    })).subscribe({
      next: (res) => {
        this.estado_pedido = res.EstadoPedido;
        this.estado_pago = res.EstadoPago;
        this.estado_preparacion = res.EstadoPreparacion;
      },
      error: (error) => {

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
  buscar() {
    console.log(this.ProductoBuscar.value.estado_pedido);
    this.reload_producto.next();
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
        dataTablesParameters.filtrar_pedido = this.ProductoBuscar.value.filtrar_pedido;
        dataTablesParameters.id_estado_pedido = this.ProductoBuscar.value.estado_pedido;
        dataTablesParameters.id_estado_preparacion = this.ProductoBuscar.value.estado_preparacion;
        dataTablesParameters.id_estado_pago = this.ProductoBuscar.value.estado_pago;
        var checked: any = [];
        $("input[name='categoria_padre']:checked").each((i: any, elemento: any) => {
          checked.push(($(elemento).attr("value")));
        });
        if (checked.length > 0) {
          dataTablesParameters.categoria_padres = checked;
        }

        this.http.post<DataTablesResponse>(
          "http://localhost/MVC_CRM/?controller=Pedido&action=ListarPedidos",
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
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
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
        if (this.ProductoBuscar.value.glosa_producto) {
          dataTablesParameters.glosa_producto = this.ProductoBuscar.value.glosa_producto;

        }
        if (this.ProductoBuscar.value.sku_producto) {
          dataTablesParameters.sku_producto = this.ProductoBuscar.value.sku_producto;
        }
        if (this.ProductoBuscar.value.id_tipo_inventario != '') {
          dataTablesParameters.id_tipo_inventario = this.ProductoBuscar.value.id_tipo_inventario;
        }

        var checked: any = [];
        $("input[name='categoria_padre']:checked").each((i: any, elemento: any) => {
          checked.push(($(elemento).attr("value")));
        });
        if (checked.length > 0) {
          dataTablesParameters.categoria_padres = checked;
        }
        this.http.post<DataTablesResponse>(
          "http://localhost/MVC_CRM/?controller=Producto&action=ListaProductoDeshabilitado",
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
          width: "10%"
        },
        {
          width: "10%"
        },
        {
          width: "10%"
        }
      ],
    };
  }

  listarCategorias(valor_inventario: any) {
    this.servicio_categoria.CargarCategoria(this.token, valor_inventario.value).pipe(finalize(() => {
    })).subscribe(
      {
        next: (arreglo) => {
          var html = "";
          var vacio = "";
          if (arreglo.categoria == null) {
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\"></ul></div></div>";
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
            var estructura_html = "<div><h6 for=\"name\" class=\"col-sm-12 control-label\">Categoría Padre</h6><div id=\"treeview_container\" class=\"hummingbird-treeview t-view-editar\" style=\"height: auto; display: block;\"><ul style='list-style: none;' id=\"treeview\" class=\"hummingbird-base\">" + html + "</ul></div></div>";
          }
          $("#treeview_container").html(estructura_html);
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

  AbrirModalGestionarStock(datos_producto: any) {
    this.Producto = datos_producto;
    console.log(this.Producto);
    $('#exampleModalCenter').modal('show');

  }

  GestionarStockProducto() {
    this.GestionarStock.markAllAsTouched()
    if (this.GestionarStock.invalid) {
      return;
    }
    this.servicio_producto.GestionarStockProducto(this.token, this.GestionarStock.value).pipe(finalize(() => {
      this.GestionarStock.reset();
      this.GestionarStock.get('accion')!.setValue('');
      this.GestionarStock.get('id_usuario')!.setValue(this.usuario.sub);
    })).subscribe({
      next: (res) => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: `Stock Del Producto Gestionado con Exito`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      },
      error: (error) => {

      }
    })
    this.GestionarStock.reset();
    $('#exampleModalCenter').modal('hide');

  }
  CambioMovimientos(valor: any) {
    if (valor.value == 1 || valor.value == 2) {
      this.tipo_movimiento = valor.value;
      this.cantidad.nativeElement.removeAttribute('disabled');
      this.cantidad.nativeElement.value = '';
    } else {
      this.cantidad.nativeElement.setAttribute("disabled", "");
      this.tipo_movimiento = null;
    }
  }
  Cantidades(valor: any) {
    switch (this.tipo_movimiento) {
      case "1":
        this.GestionarStock.get('stock_final')!.setValue(parseInt(this.Producto.stock_producto) + parseInt(valor.value));
        break;
      case "2":
        this.GestionarStock.get('stock_final')!.setValue(parseInt(this.Producto.stock_producto) - parseInt(valor.value));
        break;
      default:
        this.GestionarStock.get('stock_final')!.setValue('');
        break;
    }
  }
  GestionActivoDesactivadoProducto(accion: string, id_producto: number) {
    let texto;
    if (accion == 'ACTIVAR') {
      texto = "activar";
    } else {
      texto = "deshabilitar";
    }
    Swal.fire({
      title: `¿Estas seguro de ${texto} producto?`,
      // text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si'
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (accion == 'ACTIVAR') {
          this.servicio_producto.GestionActivoDesactivadoProducto(this.token, accion, id_producto).pipe(finalize(() => {
            this.reload_producto.next();
            this.reload_producto_deshabilitado.next();
          })).subscribe({
            next: (res) => {
              Swal.fire(
                'Listo!',
                'Producto Activado con Exito.',
                'success'
              )
            },
            error: (error) => {

            }
          })
        } else {
          this.servicio_producto.GestionActivoDesactivadoProducto(this.token, accion, id_producto).pipe(finalize(() => {
            this.reload_producto.next();
            this.reload_producto_deshabilitado.next();
          })).subscribe({
            next: (res) => {
              Swal.fire(
                'Listo!',
                'Producto Deshabilitado con Exito.',
                'success'
              )
            },
            error: (error) => {

            }
          })
        }

      }
    })

  }

}
