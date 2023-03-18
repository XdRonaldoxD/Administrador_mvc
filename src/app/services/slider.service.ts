import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class SliderService {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService,
  ) { 
    this.token = this.servicio_login.getToken();
  }
  ActualizarCrearSlider( formulario: any, file: any, file_mobile: any): Observable<any> {
    const formData = new FormData();
    formData.append('formulario', JSON.stringify(formulario));
    if (file) {
      formData.append('imagen_escritorio', file, file.name);
    }
    if (file_mobile) {
      formData.append('imagen_mobile', file_mobile, file_mobile.name);
    }
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "?controller=Slider&action=ActualizarCrearSlider", formData, { headers: headers })
  }
  GestionActivoDesactivadoSlider(id_slider: any, accion: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_slider', id_slider);
    formData.append('accion', accion);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "?controller=Slider&action=GestionActivoDesactivado", formData, { headers: headers })
  }






}
