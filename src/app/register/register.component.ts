import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { LoginService } from '../services/login.service';


declare var Swal: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registrarForm!: FormGroup;
  constructor(private fb: FormBuilder,
    private servicio_login: LoginService,
    ) {}
  ngOnInit(): void {
    this.registrarForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido_paterno: ['', [Validators.required]],
      apellido_materno: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  RegistrarSession(){
    this.registrarForm.markAllAsTouched()
    if (this.registrarForm.invalid) {
      return;
    }

    this.servicio_login.RegistrarUsuario(this.registrarForm.value).pipe(finalize(()=>{
      this.registrarForm.reset();
    }))
    .subscribe({
      next: (respuesta) => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: 'Usuario Creado con exito.',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
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

}
