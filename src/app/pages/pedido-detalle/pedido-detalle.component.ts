import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Pedido } from '../../interface/Pedido';
import { PedidoService } from '../../services/pedido.service';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pedido-detalle',
  templateUrl: './pedido-detalle.component.html',
  styleUrls: ['./pedido-detalle.component.css']
})
export class PedidoDetalleComponent implements OnInit {

  estado_pedido:string='';
  estado_preparacion:string='';
  // token: string;
  pedido: Pedido | undefined;
  PedidoDetalle:any=[];
  EstadoPedido:any=[];
  EstadoPreparacion:any=[];
  constructor(
    private api_Pedido: PedidoService,
    private route: ActivatedRoute,
    private servicio_login: LoginService
  ) {
 
    this.route.data.subscribe((res:any)=>{
      this.pedido=res.pedidodetalle.Pedido;
      this.EstadoPedido=res.pedidodetalle.EstadoPedido;
      this.EstadoPreparacion=res.pedidodetalle.EstadoPreparacion;
      this.PedidoDetalle=res.pedidodetalle.PedidoDetalle;
      // this.estado_pedido=this.pedido?.id_estado_pedido;
      // this.estado_preparacion=this.pedido?.id_estado_preparacion;
    })

  }

  ngOnInit(): void {
  }

}
