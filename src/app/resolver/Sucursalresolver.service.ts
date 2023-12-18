import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import {  catchError, EMPTY } from 'rxjs';
import { LoginService } from '../services/login.service';
import { StaffService } from '../services/staff.service';
import { SucursalService } from '../services/sucursal.service';

@Injectable({
  providedIn: 'root'
})
export class SucursalresolverService implements Resolve<any>{
  identificacion: any;
  constructor(
    private router: Router,
    private sucursal: SucursalService,
    private servicio_login: LoginService
  ) { 
    this.identificacion = this.servicio_login.getIdentity();
  }

//TRAEMOS LOS DATOS PERSONALES
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
      return this.sucursal.TraerDatosSucursal().pipe(catchError(err=>{
        this.router.navigate(['/inicio']);
        return EMPTY;
      }))
    
  }
}
