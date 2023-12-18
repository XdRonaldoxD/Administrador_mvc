import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService

  ) { 
    this.token = this.servicio_login.getToken(); 
  }

  ListaProductosRelacionado(token: any, id_producto: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_producto', id_producto);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=NuevoProducto&action=ListaProductosRelacionado", formData, { headers: headers })
  }
  TraerProductosID(id_producto: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_producto', id_producto);
    Params = Params.append('consultaquery', true);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Producto&action=TraerDatosProductos", { headers: headers, params: Params })
  }
  TraerProductos(): Observable<any> {
    let Params = new HttpParams();
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Producto&action=TraerProductos", { headers: headers, params: Params })
  }
  TraerProductoIdRelacionado(id_producto: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_producto', id_producto);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Producto&action=traerProductoIdRelacionado", { headers: headers, params: Params })
  }
  
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
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=NuevoProducto&action=GuardarProductoActualizar", formData, { headers: headers })
  }

  GestionarStockProducto(GestionarStock: any): Observable<any> {
    const formData = new FormData();
    formData.append('GestionarStock', JSON.stringify(GestionarStock));
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Producto&action=GestionarStockProducto", formData, { headers: headers })
  }
  TraerBodegaStock(id_producto:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_producto', id_producto);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Producto&action=traerBodegaStock", formData, { headers: headers })
  }

  GestionActivoDesactivadoProducto(accion: any, id_producto: any) {
    const formData = new FormData();
    formData.append('accion', accion);
    formData.append('id_producto', id_producto);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Producto&action=GestionActivoDesactivadoProducto", formData, { headers: headers })
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
    return this.httpcliente.get(environment.api_url+"?controller=Producto&action=VerificarSku", { headers: headers, params: Params })
  }

  TraerAfectacion(){
    const headers = new HttpHeaders({
      Authorization: this.token 
    });
    return this.httpcliente.get(environment.api_url+"?controller=Producto&action=traerAfectacion", { headers: headers })
  }
  BuscarMarca(term:string): Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('search', term);
    const headers = new HttpHeaders({
      Authorization: this.token 
    });
    return this.httpcliente.get(environment.api_url+"?controller=NuevoProducto&action=filtrarMarca", { headers: headers , params: Params })
  }

  BuscarProductoRelacionado(term:string,id_producto:any): Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('search', term);
    Params = Params.append('id_producto',JSON.stringify(id_producto));
    const headers = new HttpHeaders({
      Authorization: this.token 
    });
    return this.httpcliente.get(environment.api_url+"?controller=Producto&action=filtrarProductoRelacionado", { headers: headers , params: Params })
  }
}
