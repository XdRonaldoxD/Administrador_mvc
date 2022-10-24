import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoginService } from '../services/login.service';



declare var Swal: any;
declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm!: FormGroup;
  id_usuario: any;
  private unsubscribe$ = new Subject<void>();
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private servicio_login: LoginService,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    },);

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  login(): void {
    this.loginForm.markAllAsTouched()
    if (this.loginForm.invalid) {
      return;
    }
    // Otra Manera de finalizar el servicio con pipe
    this.servicio_login.LoginUsuario(this.loginForm.value)
      .pipe(
        //USAMOS PARA EL USO DE MEMORIA(TOMARA COMPLETADO EL  SUBCRIBE)
        takeUntil(this.unsubscribe$)
        )
      .subscribe({
        next: (respuesta) => {
          if (!isNaN(respuesta.id_usuario)) {
            this.id_usuario = respuesta.id_usuario;
            $('#exampleModalCenter').modal('show');
          } else {
            this.servicio_login.savetoken(respuesta);
            this.servicio_login.LoginUsuario(this.loginForm.value, true)
              .pipe(finalize(() => {
                this.router.navigateByUrl('/inicio').then();
              })
              ).subscribe({
                next: (respuesta) => {
                  // localStorage.setItem('UserIdentificado',JSON.stringify(respuesta))
                  this.servicio_login.saveIdentity(respuesta);
                },
              });
          }
          // localStorage.setItem('token', respuesta);

        },
        error: (error) => {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'error',
            title: 'Usuario Incorrecto',
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 5000
          })

        }
      });
  }

  CerrandoSession() {
    // console.log(this.user.id);
    this.servicio_login.cerrarSession(this.id_usuario)
    .pipe(takeUntil(this.unsubscribe$))
      .subscribe(respo => {
        // console.log(respo);
        $('#exampleModalCenter').modal('hide');
      })
  }

}
