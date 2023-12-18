import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { mustMatchValidator } from 'src/app/functions/validators/must-match';
import { StaffService } from 'src/app/services/staff.service';

@Component({
  selector: 'app-datos-personales',
  templateUrl: './datos-personales.component.html',
  styleUrls: ['./datos-personales.component.css']
})
export class DatosPersonalesComponent implements OnInit {
  InformacionStaff!: FormGroup;
  verificador_email: boolean = false;
  GuardarInformacion: boolean = false;
  Unsuscribe: any = new Subject();

  Perfil: any = [];
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Staff: StaffService,
    private toast: ToastrService

  ) {
    this.route.data.subscribe((res: any) => {
      const staff = res.datopersonal?.Staff ?? {};
      this.Perfil = res.datopersonal?.Perfil;
      this.InformacionStaff = this.fb.group({
        id_usuario: [staff.id_usuario],
        id_staff: [staff.id_staff || ''],
        nombre_staff: [staff.nombre_staff || '', [Validators.required]],
        apellidopaterno_staff: [staff.apellidopaterno_staff || '', [Validators.required]],
        apellidomaterno_staff: [staff.apellidomaterno_staff || ''],
        e_mail_staff: [staff.e_mail_staff || ''],
        telefono_staff: [staff.telefono_staff || ''],
        celular_staff: [staff.celular_staff || ''],
        sexo_staff: [staff.sexo_staff || ''],
        id_perfil: [staff.id_perfil || '',[Validators.required]],
        newPassword: [''],
        confirmPassword: [''],
      },
        { validators: [mustMatchValidator('newPassword', 'confirmPassword')] }

      );
    })
  }

  ngOnInit(): void {
    $("[data-dismiss='modal']").click();
  }



  GuardarCompleto() {
    this.GuardarInformacion = true;
    this.InformacionStaff.markAllAsTouched()
    if (this.InformacionStaff.invalid) {
      this.toast.error(`Completar los campos obligatorios.`, '', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
      });
      this.GuardarInformacion = false;
      return;
    }
    this.Staff.GestionarStaff(this.InformacionStaff.value).pipe(takeUntil(this.Unsuscribe),
      finalize(() => {
        this.GuardarInformacion = false;
      })).subscribe({
        next: resp => {
          this.toast.success(`Staf ${resp} Exitosamente`, 'Realizado', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }, error: error => {
          this.toast.error(`${error}`, 'Error', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      })


  }

  VerificarEmailStaff(email: any) {

  }

}
