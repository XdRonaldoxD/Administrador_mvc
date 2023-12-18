import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  constructor(
    private httpcliente: HttpClient
  ) { }


  Inventario(token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Categoria&action=TraerTipoInventario",null,{headers:headers})
  }
  CargarCategoria(token:any,id_tipo_inventario:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_tipo_inventario', id_tipo_inventario);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Categoria&action=CargarCategoria", formData,{headers:headers})
  }

  GestionarCategoria(token:any,formulario:any,categoria_padre:any,imagen:any): Observable<any> {
    const formData = new FormData();
    formData.append('formulario', JSON.stringify(formulario));
    formData.append('accion', formulario.accion);
    formData.append('categoria_padre', JSON.stringify(categoria_padre));
    formData.append('imagen',imagen)
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Categoria&action=GestionarCategoria", formData,{headers:headers})
  }

  TraerCategoria(token:any,id_categoria:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_categoria', id_categoria);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Categoria&action=TraerCategoria", formData,{headers:headers})
  }

  Habilitar_Deshabilitar_Categoria(token:any,id_categoria:any,accion:string): Observable<any> {
    const formData = new FormData();
    formData.append('id_categoria', id_categoria);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Categoria&action=Habilitar_Deshabilitar_Categoria", formData,{headers:headers})
  }



  

  
}
