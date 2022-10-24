import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import {  catchError, EMPTY, Observable } from 'rxjs';
import { Pedido } from '../interface/Pedido';
import { PedidoService } from '../services/pedido.service';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoresolverService implements Resolve<any>{
  token: string;
  constructor(
    private router: Router,
    private api_Pedido: PedidoService,
    private servicio_login: LoginService
  ) { 
    this.token = this.servicio_login.getToken();
  }

//TRAEMOS TODOS LOS DETALLE DEL PEDIDO EN UN OBSERVABLE
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
      return this.api_Pedido.TraerPedido(route.paramMap.get('id_pedido'),this.token).pipe(catchError(err=>{
        this.router.navigate(['/inicio']);
        return EMPTY;
      }))
    
  }
}
