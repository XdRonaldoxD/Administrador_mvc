import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { ProductoService } from '../services/producto.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class TraerDatosProductoService implements Resolve<any>{

  constructor(
    private router: Router,
    private api: ProductoService,
    private toastr: ToastrService
  ) {
  }

  //TRAEMOS TODOS LOS DETALLE DEL PEDIDO EN UN OBSERVABLE
  resolve(route: ActivatedRouteSnapshot) {
    return this.api.TraerProductos().pipe(catchError(err => {
      this.toastr.error(`Verificar el Producto`, 'Nuevo Producto', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      return EMPTY;
    }))

  }
}
