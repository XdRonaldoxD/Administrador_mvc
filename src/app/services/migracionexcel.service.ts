import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class MigracionexcelService {
  protected token: any;
  protected UserIdentificado: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService

  ) {
    this.token = this.servicio_login.getToken();
    this.UserIdentificado=this.servicio_login.getIdentity();
   }
  EnviarArchivoProducto(file:any,accion_cargar:any,id_usuario:any):Observable<any>{
    const formData=new FormData();
    formData.append('archivo',file)
    formData.append('tipo_accion',accion_cargar)
    formData.append('id_usuario',id_usuario)
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"&controller=ProductoExcel&action=EnviarArchivoProducto",formData,{headers})
  }

  traerTipoDocumento():Observable<any>{
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"&controller=LibroVentas&action=traerTipoDocumento",{headers})
  }
  exportarLibroVentas(informacionForm:any):Observable<any>{
    const formData=new FormData();
    formData.append('informacionForm',JSON.stringify(informacionForm));
    formData.append('id_usuario',this.UserIdentificado.sub);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"&controller=LibroVentas&action=exportarLibroVentas",formData,{headers})
  }

  
  

}
