import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { Pedido } from '../../interface/Pedido';
import { PedidoService } from '../../services/pedido.service';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { finalize, Subject, takeUntil } from 'rxjs';

declare var Swal: any;
@Component({
  selector: 'app-pedido-detalle',
  templateUrl: './pedido-detalle.component.html',
  styleUrls: ['./pedido-detalle.component.css']
})
export class PedidoDetalleComponent implements OnInit, OnDestroy {

  estado_pedido: string = '';
  estado_preparacion: string = '';
  // token: string;
  pedido: Pedido | undefined;
  PedidoDetalle: any = [];
  EstadoPedido: any = [];
  EstadoPreparacion: any = [];
  Unsuscribe: any = new Subject();

  constructor(
    private api_Pedido: PedidoService,
    private route: ActivatedRoute,
    private servicio_login: LoginService
  ) {

    this.route.data.subscribe((res: any) => {
      this.pedido = res.pedidodetalle.Pedido;
      this.EstadoPedido = res.pedidodetalle.EstadoPedido;
      this.EstadoPreparacion = res.pedidodetalle.EstadoPreparacion;
      this.PedidoDetalle = res.pedidodetalle.PedidoDetalle;
      this.estado_pedido = this.pedido?.id_estado_pedido;
      this.estado_preparacion = this.pedido?.id_estado_preparacion;
    })
   
  }

  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
  
  }
  //SE TERMINE DE CARGAR LA PAGINA
  @HostListener('window:load')
  onLoad() {
    // $("#toggle_btn").trigger('click');
    $('.navbar-brand span').hide();
    window.addEventListener("load", (event) => {
      console.log("page is fully loaded");
    });
    window.addEventListener("load", (event) => {
      console.log("page is fully loaded");
    });
  }
  
  //
  ngOnDestroy(): void {
    this.Unsuscribe.unsubscribe();
  }

  ActualizarPedidoEstados(accion: string, id_actualizar_estado_preparacion: any) {
    this.api_Pedido.ActualizarPedidoEstados(this.pedido?.id_pedido, this.servicio_login.getToken(), accion, id_actualizar_estado_preparacion)
      .pipe(takeUntil(this.Unsuscribe))
      .subscribe({
        next: (res) => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'success',
            title: 'Actualizado Correctamente.',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })
        }, error: (error) => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'error',
            title: 'Error al actualizar.',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })
        }
      })
  }


}
