import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  linkApi = 'http://localhost/MVC_neuro/?';
  token: any;
  UserIdentificado: any;
  constructor(
    private httpcliente: HttpClient
  ) { }

  getIdentity() {
    let identity = localStorage.getItem('UserIdentificado');
    if (identity && identity != 'undefined') {
      this.UserIdentificado = JSON.parse(identity);
    } else {
      this.UserIdentificado = null;
    }
    return this.UserIdentificado;
  }

  getToken() {
    let token = localStorage.getItem('token');
    if (token && token != 'undefined') {
      this.token =token;
    } else {
      this.token = null;
    }
    return this.token;
  }
  saveIdentity(respuesta:any){
    localStorage.setItem('UserIdentificado', JSON.stringify(respuesta));
  }
  savetoken(respuesta:any){
    localStorage.setItem('token', respuesta);
  }
  deleteSession(){
    localStorage.removeItem("UserIdentificado");
    localStorage.removeItem("token");
  }


  LoginUsuario(user: any, getToken:any = null): Observable<any> {
 
    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('password', user.password);
    if (getToken != null) {
    formData.append('getToken',  user.getToken);
    }
    const headers = new HttpHeaders();

    return this.httpcliente.post("http://localhost/MVC_neuro/?controller=Usuario&action=login", formData, { headers: headers })
  }


  TraerChatLineaActivo(token: any, linea=false): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('linea', linea);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_NEURO/?Apicontroller=Pusher&action=TraerChatLineaActivo", { headers: headers,params: Params  })
  }

  ChatboxEventAdministrador(token: any, conversacion:any,identificadorcliente_log_chat:any,id_usuario:any,mensaje_texto:any): Observable<any> {
    const Params = new FormData();
    Params.append('conversacion', JSON.stringify(conversacion));
    Params.append('cliente_identificado', identificadorcliente_log_chat);
    Params.append('mensaje_texto', mensaje_texto);
    Params.append('id_usuario', id_usuario);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?Apicontroller=Pusher&action=ChatboxEventAdministrador", Params,{ headers: headers  })
  }
  DesactivarCliente(token: any,identificadorcliente_log_chat:any){
    const Params = new FormData();
    Params.append('cliente_identificado', identificadorcliente_log_chat);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post("http://localhost/MVC_NEURO/?Apicontroller=Pusher&action=CerrarChatBoxCliente", Params,{ headers: headers  })
  }

  

  RegistrarUsuario(user:any, getToken = null): Observable<any> {
    if (getToken != null) {
      user.getToken = 'true'
    }
    const formData = new FormData();
    formData.append('password_usuario', user.password);
    formData.append('nombre_usuario', user.nombre);
    formData.append('apellido_p_usuario', user.apellido_paterno);
    formData.append('apellido_m_usuario', user.apellido_materno);
    formData.append('email_usuario', user.email);
    const headers = new HttpHeaders();
    return this.httpcliente.post("http://localhost/MVC_neuro/?controller=Usuario&action=RegistrarUsuario", formData, { headers: headers })
  }

  cerrarSession(id_user:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_usuario', id_user);
    const headers = new HttpHeaders();
    return this.httpcliente.post("http://localhost/MVC_neuro/?controller=Usuario&action=EliminarSesion", formData, { headers: headers })
  }

  VerificacionUser(token:any,user_id:any,session_id:any):Observable<any>{
    const formData = new FormData();
    formData.append('user_id', user_id);
    formData.append('session_id', session_id);
    const headers = new HttpHeaders({
      Authorization: token
    });

    return this.httpcliente.post("http://localhost/MVC_neuro/?controller=Usuario&action=ConsultaUsuario",formData,{headers:headers})
  }
}
