import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotaVenta {

  constructor(
    private httpcliente: HttpClient
  ) { }

  ListaMediosPagos(token: any): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=ListaMediosPagos", { headers: headers })
  }
  TraerDepartamento(token:string):Observable<any>{
    
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=TraerDepartamento", { headers: headers })
  }

  AsignarCliente(token:string):Observable<any>{
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=AsignarClienteGenerico", { headers: headers })
  }
  TraerProvincia(token:string,id_departamento:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_departamento', id_departamento);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=TraerProvincia", { headers: headers , params: Params })
  }
  TraerDistrito(token:string,id_provincia:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_provincia', id_provincia);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=TraerDistrito", { headers: headers , params: Params })
  }

  GuardarCliente(token:string,informacion_cliente:any):Observable<any>{
    const formData = new FormData();
    formData.append('informacion_cliente', JSON.stringify(informacion_cliente));
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=NotaVenta&action=GuardarCliente", formData, { headers: headers })
  }

  GenerarNegocio(token:string,datos:any):Observable<any>{
 
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"?controller=Negocio&action=GenerarNegocio", datos, { headers: headers })
  }

  VerificarCajaAbierta(token:string,id_usuario:any):Observable<any>{
    let Params = new HttpParams();
    Params = Params.append('id_usuario', id_usuario);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"?controller=NotaVenta&action=VerificarCajaAbierta", { headers: headers ,params:Params })
  }

  

  BuscarDni(Dni_boleta:any):Observable<any>{
    return this.httpcliente.get(`https://dniruc.apisperu.com/api/v1/dni/${Dni_boleta}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNtaXRoeGQxMThAZ21haWwuY29tIn0.24c7XETuRuTQLUqSjOH7BsKM19n6kKMOtY06qeUYX40`)
  }
  BuscarRuc(Ruc_factura:any):Observable<any>{
    return this.httpcliente.get(`https://dniruc.apisperu.com/api/v1/ruc/${Ruc_factura}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNtaXRoeGQxMThAZ21haWwuY29tIn0.24c7XETuRuTQLUqSjOH7BsKM19n6kKMOtY06qeUYX40`)
  }

}
