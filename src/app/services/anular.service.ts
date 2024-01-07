import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class AnularService {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
   }

  TraerDocumento(id_documento:any,documento:any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_documento', id_documento);
    Params = Params.append('documento', documento);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"&controller=AnularDocumento&action=traerDocumento", { headers: headers ,params: Params})
  }

  TraerMotivoDevolucion(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"&controller=AnularDocumento&action=traerMotivoDevolucion", { headers: headers})
  }

  GenerarDocumento(datos:any): Observable<any> {
    const formData = new FormData();
    formData.append('datos_anulacion', JSON.stringify(datos));
    formData.append('id_documento', datos.id_documento);
    formData.append('tipo_documento', datos.tipo_documento);
    formData.append('documento', datos.documento);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"&controller=AnularDocumento&action=anularDocumentoElectronico",  formData ,{ headers: headers})
  }

  EnviarCorreloElectronicoEmail(datos:any):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"&controller=NotaVenta&action=EnviarCorreloElectronicoEmail",datos,{ headers: headers })
  }

  
}
