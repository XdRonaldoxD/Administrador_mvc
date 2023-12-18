import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class NotaVenta {
  protected token: any;
  constructor(
    private httpcliente: HttpClient,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
   }

  ListaMediosPagos(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=ListaMediosPagos", { headers: headers })
  }
  TraerDepartamento():Observable<any>{
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=TraerDepartamento", { headers: headers })
  }

  AsignarCliente():Observable<any>{
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=AsignarClienteGenerico", { headers: headers })
  }

  EnviarCorreloElectronicoEmail(datos:any):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=NotaVenta&action=EnviarCorreloElectronicoEmail",datos,{ headers: headers })
  }

  BuscarDepartamento(departamento:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('departamento', departamento);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=BuscarDepartamento", { headers: headers , params: Params })
  }
  BuscarProvincia(provincia:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('provincia', provincia);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=BuscarProvincia", { headers: headers , params: Params })
  }
  BuscarDistrito(distrito:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('distrito', distrito);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=BuscarDistrito", { headers: headers , params: Params })
  }
  TraerProvincia(id_departamento:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_departamento', id_departamento);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=TraerProvincia", { headers: headers , params: Params })
  }
  TraerDistrito(id_provincia:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_provincia', id_provincia);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=TraerDistrito", { headers: headers , params: Params })
  }

  GuardarCliente(informacion_cliente:any):Observable<any>{
    const formData = new FormData();
    formData.append('informacion_cliente', JSON.stringify(informacion_cliente));
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=NotaVenta&action=GuardarCliente", formData, { headers: headers })
  }

  GenerarNegocio(datos:any):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Negocio&action=GenerarNegocio", datos, { headers: headers })
  }

  VerificarCajaAbierta(id_usuario:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_usuario', id_usuario);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=VerificarCajaAbierta", { headers: headers ,params:Params })
  }

  FiltrarCliente(search:any,documento:string):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('search', search);
    Params = Params.append('documento', documento);
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Cliente&action=FiltrarCliente", { headers: headers ,params:Params })
  }
  BuscarDni(Dni_boleta:any):Observable<any>{
    return this.httpcliente.get(`https://dniruc.apisperu.com/api/v1/dni/${Dni_boleta}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNtaXRoeGQxMThAZ21haWwuY29tIn0.24c7XETuRuTQLUqSjOH7BsKM19n6kKMOtY06qeUYX40`)
  }
  BuscarRuc(Ruc_factura:any):Observable<any>{
    return this.httpcliente.get(`https://dniruc.apisperu.com/api/v1/ruc/${Ruc_factura}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNtaXRoeGQxMThAZ21haWwuY29tIn0.24c7XETuRuTQLUqSjOH7BsKM19n6kKMOtY06qeUYX40`)
  }

}
