import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SucursalService {

  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
  }
  TraerDatosSucursal(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url + "?controller=Sucursal&action=traerDatosSucursal", { headers })
  }
  buscarClienteDefecto(term:string): Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('search', term);
    const headers = new HttpHeaders({
      Authorization: this.token 
    });
    return this.httpcliente.get(environment.api_url+"?controller=Sucursal&action=buscarClienteDefecto", { headers: headers , params: Params })
  }
  traerSucursal(id_sucursal: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_sucursal', id_sucursal);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "?controller=Sucursal&action=traerSucursal", formData, { headers: headers })
  }
  gestionarSucursal(sucursal: any): Observable<any> {
    const formData = new FormData();
    formData.append('sucursal', JSON.stringify(sucursal));
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "?controller=Sucursal&action=gestionarSucursal", formData, { headers: headers })
  }
  gestionarestadoSucursal(id_sucursal:any,vigente_sucursal:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_sucursal', id_sucursal);
    formData.append('vigente_sucursal', vigente_sucursal);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Sucursal&action=estadoSucursal", formData,{headers:headers})
  }
  
}
