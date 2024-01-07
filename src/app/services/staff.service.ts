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
    return this.httpcliente.post(environment.api_url + "&controller=Staff&action=MostrarStaff", formData, { headers: headers })
  }

  GestionarStaff(InformacionStaff: any): Observable<any> {
    const formData = new FormData();
    formData.append('InformacionStaff', JSON.stringify(InformacionStaff));
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Staff&action=GestionarStaff", formData, { headers: headers })
  }

  ActualizarPass(Informacionpassword: any): Observable<any> {
    const formData = new FormData();
    formData.append('newPassword', Informacionpassword.newPassword);
    formData.append('confirmPassword',Informacionpassword.confirmPassword);
    formData.append('id_usuario', Informacionpassword.id_usuario);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Staff&action=updatepass", formData, { headers: headers })
  }

  mostrarDatosUsuario(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"&controller=Staff&action=mostrarDatosUsuario", { headers: headers})
  }

  GestionActivoDesactivadoStaff(id_usuario: any, accion: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_usuario', id_usuario);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Staff&action=gestionActivoDesactivado", formData, { headers: headers })
  }

  CorreoEdicionUsuarioEnUso(id_staff:any,email_usuario:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('email_usuario', email_usuario);
    Params = Params.append('id_staff', id_staff);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"&controller=Staff&action=correoEdicionUsuarioEnUso",{ params: Params , headers: headers })
  }

}
