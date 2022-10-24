import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private httpcliente: HttpClient
  ) { }

  ListaProductosRelacionado(token: any, id_producto: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_producto', id_producto);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=NuevoProducto&action=ListaProductosRelacionado", formData, { headers: headers })
  }
  TraerProductosID(id_producto: any, token: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_producto', id_producto);
    Params = Params.append('consultaquery', true);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_NEURO/?controller=Producto&action=TraerDatosProductos", { headers: headers, params: Params })
  }

  // TraerProductosID(id_producto: any, token: any): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('id_producto', id_producto);
  //   formData.append('consultaquery', '1');
  //   const headers = new HttpHeaders({
  //     Authorization: token
  //   });
  //   return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Producto&action=TraerDatosProductos", formData, { headers: headers })
  // }

  GuardarProductoActualizar(token: any, valorescategoria: any, informacionForm: any, PrecioStockForm: any, imagenes_producto: any, colores: any, especificaciones: any, producto_relacion: any, atributo_seleccionado: any): Observable<any> {
    const formData = new FormData();
    formData.append('informacionForm', JSON.stringify(informacionForm));
    formData.append('PrecioStockForm', JSON.stringify(PrecioStockForm));
    formData.append('imagenes_producto', JSON.stringify(imagenes_producto));
    formData.append('colores', JSON.stringify(colores));
    formData.append('especificaciones', JSON.stringify(especificaciones));
    formData.append('producto_relacion', JSON.stringify(producto_relacion));
    formData.append('valorescategoria', JSON.stringify(valorescategoria));
    formData.append('atributo_seleccionado', JSON.stringify(atributo_seleccionado));
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=NuevoProducto&action=GuardarProductoActualizar", formData, { headers: headers })
  }

  GestionarStockProducto(token: any, GestionarStock: any): Observable<any> {
    const formData = new FormData();
    formData.append('GestionarStock', JSON.stringify(GestionarStock));
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Producto&action=GestionarStockProducto", formData, { headers: headers })
  }
  GestionActivoDesactivadoProducto(token: any, accion: any, id_producto: any) {
    const formData = new FormData();
    formData.append('accion', accion);
    formData.append('id_producto', id_producto);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Producto&action=GestionActivoDesactivadoProducto", formData, { headers: headers })
  }


  removeItemFromArr(arr: any, item: any) {
    var i = arr.indexOf((items: any) => items.id_atributo == item);
    arr.splice(i, 1);
  }

  VerificarSku(token:string,codigo_producto:string,id_producto:any){
    let Params = new HttpParams();
    Params = Params.append('codigo_producto', codigo_producto);
    Params = Params.append('id_producto', id_producto);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_NEURO/?controller=Producto&action=VerificarSku", { headers: headers, params: Params })
  }

}
