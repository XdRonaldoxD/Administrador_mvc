import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
  }

  EnviarInformacionEmpresa(informacionForm: any, archivo_digital: any,imagenes:any): Observable<any> {
    const formData = new FormData();
    formData.append('informacionForm', JSON.stringify(informacionForm));
    if (archivo_digital) {
      formData.append('archivo_digital', archivo_digital, archivo_digital.name);
    }
    if (imagenes.icono_empresa) {
      formData.append('icono_empresa', imagenes.icono_empresa, imagenes.icono_empresa.name);
    }
    if (imagenes.logo_empresa_horizonta) {
      formData.append('logo_empresa_horizonta', imagenes.logo_empresa_horizonta, imagenes.logo_empresa_horizonta.name);
    }
    if (imagenes.logo_empresa_vertical) {
      formData.append('logo_empresa_vertical', imagenes.logo_empresa_vertical, imagenes.logo_empresa_vertical.name);
    }
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Empresa&action=GuardarInformacion", formData, { headers: headers })
  }



  TraerCertificadoEmpresa(id_empresa:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_empresa',id_empresa);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url + "&controller=Empresa&action=TraerCertificadoEmpresa", formData, { headers: headers })
  }
  
  TraerEmpresa(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"&controller=Empresa&action=TraerEmpresa", { headers: headers})
  }

  AccionCertificado(id_certificado_digital:any,accion:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_certificado_digital',id_certificado_digital);
    formData.append('accion',accion);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"&controller=Empresa&action=accionCertificado", formData,{ headers: headers})
  }

  BuscarRuc(Ruc_factura: any): Observable<any> {
    return this.httpcliente.get(`https://dniruc.apisperu.com/api/v1/ruc/${Ruc_factura}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNtaXRoeGQxMThAZ21haWwuY29tIn0.24c7XETuRuTQLUqSjOH7BsKM19n6kKMOtY06qeUYX40`)
  }
  

}
