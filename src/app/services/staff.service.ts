import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
  }

  MostrarStaff(id_usuario: any): Observable<any> {
    const formData = new FormData();
    if (id_usuario) {
      formData.append('id_usuario', id_usuario);
    }
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "?controller=Staff&action=MostrarStaff", formData, { headers: headers })
  }

  GestionarStaff(InformacionStaff: any): Observable<any> {
    const formData = new FormData();
    formData.append('InformacionStaff', JSON.stringify(InformacionStaff));
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "?controller=Staff&action=GestionarStaff", formData, { headers: headers })
  }

}
