import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class Caja {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();

  }

  GuardarCaja(informacion_caja: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_usuario', informacion_caja.id_usuario);
    formData.append('montoinicial_caja', informacion_caja.montoinicial_caja);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Caja&action=GuardarCaja", formData, { headers: headers })
  }
  VerificarCajaAbierta(id_usuario: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_usuario', id_usuario);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url + "&controller=Caja&action=VerificarCajaAbierta", { headers: headers, params: Params })

  }
  CerrarCaja(id_caja: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_caja', id_caja);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Caja&action=CerrarCaja", formData, { headers: headers })
  }


  TraerDetalleCaja(id_caja: any): Observable<any> {
    const formData = new FormData();
    formData.append('id_caja', id_caja);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Caja&action=TraerDetalleCaja", formData, { headers: headers })
  }


  MostrarDocumentos(id_caja: any, tipo_documento: any, id_medio_pago: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_caja', id_caja);
    Params = Params.append('tipo_documento', tipo_documento);
    Params = Params.append('id_pago', id_medio_pago);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url + "&controller=Caja&action=MostrarDocumentos", { headers: headers, params: Params })
  }

  TraerPagos(id_negocio: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_negocio', id_negocio);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url + "&controller=Venta&action=TraerPagos", { headers: headers, params: Params })
  }

  MostrarDetalleProducto(id_negocio: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_negocio', id_negocio);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url + "&controller=Venta&action=MostrarDetalleProducto", { headers: headers, params: Params })
  }

  visualizarPdfDocumento(id_documento: any, tipo_documento: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_documento', id_documento);
    formData.append('tipo_documento', tipo_documento);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Venta&action=visualizarPdfDocumento", formData, { headers: headers })

  }

  EnviarCorreoElectronico(datos: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Caja&action=EnviarCorreoElectronico", datos, { headers: headers })
  }









}
