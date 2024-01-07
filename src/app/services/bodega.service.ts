import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
  }

  gestionarBodega(bodega: any): Observable<any> {
    const formData = new FormData();
    formData.append('bodega', JSON.stringify(bodega));
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Bodega&action=gestionarBodega", formData, { headers: headers })
  }

  TraerBodega(id_bodega:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_bodega', id_bodega);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"&controller=Bodega&action=TraerBodega", formData,{headers:headers})
  }
  gestionarestadoBodega(id_bodega:any,vigente_bodega:string): Observable<any> {
    const formData = new FormData();
    formData.append('id_bodega', id_bodega);
    formData.append('vigente_bodega', vigente_bodega);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"&controller=Bodega&action=gestionarestadoBodega", formData,{headers:headers})
  }

  
}
