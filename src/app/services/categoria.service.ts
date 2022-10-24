import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  linkApi = 'http://localhost/MVC_neuro/?';
  constructor(
    private httpcliente: HttpClient
  ) { }


  Inventario(token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Categoria&action=TraerTipoInventario",null,{headers:headers})
  }
  CargarCategoria(token:any,id_tipo_inventario:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_tipo_inventario', id_tipo_inventario);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Categoria&action=CargarCategoria", formData,{headers:headers})
  }

  GestionarCategoria(token:any,formulario:any,categoria_padre:any,imagen:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_categoria', formulario.id_categoria);
    formData.append('glosa_categoria', formulario.glosa_categoria);
    formData.append('id_tipo_inventario', formulario.id_tipo_inventario);
    formData.append('descripcion_categoria', formulario.descripcion_categoria);
    formData.append('visibleOnline', formulario.visibleOnline);
    formData.append('accion', formulario.accion);
    formData.append('categoria_padre', JSON.stringify(categoria_padre));
    formData.append('imagen',imagen)
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Categoria&action=GestionarCategoria", formData,{headers:headers})
  }

  TraerCategoria(token:any,id_categoria:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_categoria', id_categoria);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Categoria&action=TraerCategoria", formData,{headers:headers})
  }

  Habilitar_Deshabilitar_Categoria(token:any,id_categoria:any,accion:string): Observable<any> {
    const formData = new FormData();
    formData.append('id_categoria', id_categoria);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Categoria&action=Habilitar_Deshabilitar_Categoria", formData,{headers:headers})
  }



  

  
}
