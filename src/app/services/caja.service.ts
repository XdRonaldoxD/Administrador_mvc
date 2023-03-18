import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Caja {

  constructor(
    private httpcliente: HttpClient
  ) { }

  TraerDepartamento(token:string):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_CRM/?controller=NotaVenta&action=TraerDepartamento", { headers: headers })
  }
  TraerProvincia(token:string,id_departamento:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_departamento', id_departamento);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_CRM/?controller=NotaVenta&action=TraerProvincia", { headers: headers , params: Params })
  }
  TraerDistrito(token:string,id_provincia:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_provincia', id_provincia);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_CRM/?controller=NotaVenta&action=TraerDistrito", { headers: headers , params: Params })
  }

  GuardarCaja(token:string,informacion_caja:any):Observable<any>{
    const formData = new FormData();
    formData.append('id_usuario', informacion_caja.id_usuario);
    formData.append('montoinicial_caja', informacion_caja.montoinicial_caja);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Caja&action=GuardarCaja", formData, { headers: headers })
  }
  CerrarCaja(token:string,id_caja:any):Observable<any>{
    const formData = new FormData();
    formData.append('id_caja', id_caja);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Caja&action=CerrarCaja", formData, { headers: headers })
  }
  

  TraerDetalleCaja(token:string,id_caja:any):Observable<any>{
    const formData = new FormData();
    formData.append('id_caja', id_caja);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Caja&action=TraerDetalleCaja", formData, { headers: headers })
  }

  TraerDetalleCajaImprimir(token:string,id_caja:any){
    let Params = new HttpParams();
    Params = Params.append('id_caja', id_caja);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Caja&action=TraerDetalleCaja", { headers: headers , params:Params})
  }

  MostrarDocumentos(token:string,id_caja:any,tipo_documento:any,id_medio_pago:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_caja', id_caja);
    Params = Params.append('tipo_documento', tipo_documento);
    Params = Params.append('id_pago', id_medio_pago);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Caja&action=MostrarDocumentos", { headers: headers ,params: Params})
  }

  TraerPagos(token:string,id_negocio:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_negocio', id_negocio);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Venta&action=TraerPagos", { headers: headers ,params: Params})
  }

  MostrarDetalleProducto(token:string,id_negocio:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_negocio', id_negocio);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=Venta&action=MostrarDetalleProducto", { headers: headers ,params: Params})
  }

  EnviarCorreoElectronico(token:string,datos:any):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Caja&action=EnviarCorreoElectronico",datos ,{ headers: headers})
  }

  

  



}
