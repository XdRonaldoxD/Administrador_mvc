import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(
    private httpcliente: HttpClient
  ) { }

  ListaProductosRelacionado(token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_CRM/?controller=Pedido&action=FiltrarEstadosPedidos", { headers: headers })
  }
  TraerPedido(id_pedido: any, token: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_pedido', id_pedido);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get("http://localhost/MVC_CRM/?controller=Pedido&action=TraerPedido", { headers: headers , params: Params })
  }
}
