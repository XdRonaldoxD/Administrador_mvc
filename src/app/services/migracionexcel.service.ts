import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MigracionexcelService {
  constructor(
    private httpcliente: HttpClient,
  ) { }
  EnviarArchivoProducto(token:any,file:any,accion_cargar:any,id_usuario:any):Observable<any>{
    const formData=new FormData();
    formData.append('archivo',file)
    formData.append('tipo_accion',accion_cargar)
    formData.append('id_usuario',id_usuario)
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=ProductoExcel&action=EnviarArchivoProducto",formData,{headers})
  }
}
