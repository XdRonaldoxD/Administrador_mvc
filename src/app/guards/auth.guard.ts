import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _loginServicio:LoginService,
    private router:Router
  ){}
  canActivate():  Promise<boolean>  | boolean   {
    let token = this._loginServicio.getToken();
    let identity = this._loginServicio.getIdentity();
    if (token!=null) {
      let payload = JSON.parse(atob(token.split(".")[1]));
      let expirado = this.expirado(identity.expiracion);
      // console.log("expiracion",expirado);
      if(expirado){
        this.router.navigate(["/IniciarSession"]);
        localStorage.removeItem("UserIdentificado");
        localStorage.removeItem("token");
        return false;
      }
      this._loginServicio.VerificacionUser(token,payload.sub,identity.session_id)
      .subscribe({
        next:(respo): any =>{
          console.log(respo);
          if (respo==true) {
            localStorage.removeItem("UserIdentificado");
            localStorage.removeItem("token");
            this.router.navigate(["/login"]);
            return false;
          }
        }
      });
    }else{
      localStorage.removeItem("UserIdentificado");
      localStorage.removeItem("token");
      this.router.navigate(["/IniciarSession"]);
      return false;
    }
    return true;
  }
  expirado(fechaExp: number) {
    let ahora = new Date().getTime() / 1000;
    if (fechaExp < ahora) {
      return true;
    } else {
      return false;
    }
  }
  
}
