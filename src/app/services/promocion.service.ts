import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService,
  ) { 
    this.token = this.servicio_login.getToken();
  }
  gestionarPromociones( formulario: any, file: any): Observable<any> {
    const formData = new FormData();
    formData.append('formulario', JSON.stringify(formulario));
    if (file) {
      formData.append('imagen_promocion', file, file.name);
    }
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Promociones&action=gestionarPromociones", formData, { headers: headers })
  }
  eliminarPromocion(id_promocion: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_promocion', id_promocion);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Promociones&action=eliminarPromocion", formData, { headers: headers })
  }






}
