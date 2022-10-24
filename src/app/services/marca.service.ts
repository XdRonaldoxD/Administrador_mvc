import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  linkApi = 'http://localhost/MVC_neuro/?';
  constructor(
    private httpcliente: HttpClient
  ) { }
  GestionarMarca(token: any, formulario: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', formulario.id_marca);
    formData.append('glosa_marca', formulario.glosa_marca);
    formData.append('accion', formulario.accion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Marca&action=GestionarMarca", formData, { headers: headers })
  }
  TraerMarca(token: any, id_marca: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', id_marca);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Marca&action=TraerMarca", formData, { headers: headers })
  }
  Habilitar_Deshabilitar_Marca(token: any, id_marca: any, accion: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', id_marca);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?controller=Marca&action=Habilitar_Deshabilitar_Marca", formData, { headers: headers })
  }
}
