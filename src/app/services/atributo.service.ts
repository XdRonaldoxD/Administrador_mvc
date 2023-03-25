import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AtributoService {

  constructor(
    private httpcliente: HttpClient
  ) { }
  CargarAtributo(token:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Atributo&action=CargarAtributo",{headers:headers})
  }

  GestionarAtributo(token:any,formulario:any,atributo_padre:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_atributo', formulario.id_atributo);
    formData.append('glosa_atributo', formulario.glosa_atributo);
    formData.append('id_tipo_inventario', formulario.id_tipo_inventario);
    formData.append('descripcion_atributo', formulario.descripcion_atributo);
    formData.append('accion', formulario.accion);
    formData.append('atributo_padre', JSON.stringify(atributo_padre));
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Atributo&action=GestionarAtributo", formData,{headers:headers})
  }

  TraerCategoria(token:any,id_atributo:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_atributo', id_atributo);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Atributo&action=TraerCategoria", formData,{headers:headers})
  }

  Habilitar_Deshabilitar_Categoria(token:any,id_atributo:any,accion:string): Observable<any> {
    const formData = new FormData();
    formData.append('id_atributo', id_atributo);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Atributo&action=Habilitar_Deshabilitar_Categoria", formData,{headers:headers})
  }


}
