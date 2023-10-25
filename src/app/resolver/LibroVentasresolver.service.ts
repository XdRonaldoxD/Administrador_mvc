import { Injectable } from '@angular/core';
import {  Resolve, Router } from '@angular/router';
import {  catchError, EMPTY} from 'rxjs';
import { LoginService } from '../services/login.service';
import { MigracionexcelService } from '../services/migracionexcel.service';

@Injectable({
  providedIn: 'root'
})
export class LibroVentasService implements Resolve<any>{
  token: string;
  constructor(
    private router: Router,
    private api: MigracionexcelService,
    private servicio_login: LoginService
  ) { 
    this.token = this.servicio_login.getToken();
  }

//TRAEMOS TODOS LOS DETALLE DEL PEDIDO EN UN OBSERVABLE
  resolve(){
      return this.api.traerTipoDocumento().pipe(catchError(err=>{
        this.router.navigate(['/inicio']);
        return EMPTY;
      }))
    
  }
}
