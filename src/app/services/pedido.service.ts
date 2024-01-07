import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(
    private httpcliente: HttpClient
  ) { 
  }

  ListaProductosRelacionado(token: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"&controller=Pedido&action=FiltrarEstadosPedidos", { headers: headers })
  }
  TraerPedido(id_pedido: any, token: any): Observable<any> {
    let Params = new HttpParams();
    Params = Params.append('id_pedido', id_pedido);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.get(environment.api_url+"&controller=Pedido&action=TraerPedido", { headers: headers , params: Params })
  }
  ActualizarPedidoEstados(id_pedido: any, token: any,accion:string,id_actualizar_estado_preparacion:any): Observable<any> {
    const formData = new FormData();
    formData.append('id_pedido',id_pedido);
    formData.append('accion',accion);
    formData.append('id_actualizar_estado_preparacion',id_actualizar_estado_preparacion);
    const headers = new HttpHeaders({
      Authorization: token
    });
    return this.httpcliente.post(environment.api_url+"&controller=Pedido&action=ActualizarPedidoEstados",formData ,{headers: headers})
  }
}
