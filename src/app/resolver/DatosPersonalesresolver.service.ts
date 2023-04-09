import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import {  catchError, EMPTY } from 'rxjs';
import { LoginService } from '../services/login.service';
import { StaffService } from '../services/staff.service';

@Injectable({
  providedIn: 'root'
})
export class DatosPersonalesresolverService implements Resolve<any>{
  identificacion: any;
  constructor(
    private router: Router,
    private Staff: StaffService,
    private servicio_login: LoginService
  ) { 
    this.identificacion = this.servicio_login.getIdentity();
  }

//TRAEMOS LOS DATOS PERSONALES
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
      return this.Staff.MostrarStaff(route.paramMap.get('id_usuario')).pipe(catchError(err=>{
        this.router.navigate(['/inicio']);
        return EMPTY;
      }))
    
  }
}
