import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
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
    return this.httpcliente.post(environment.api_url+"?controller=Marca&action=gestionarMarca", formData, { headers: headers })
  }
  TraerMarca(token: any, id_marca: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', id_marca);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Marca&action=traerMarca", formData, { headers: headers })
  }
  Habilitar_Deshabilitar_Marca(token: any, id_marca: any, accion: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_marca', id_marca);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Marca&action=actualizarestadoMarca", formData, { headers: headers })
  }
}
