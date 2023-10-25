import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { formatoFecha } from 'src/app/functions/validators/helper';
import { LoginService } from 'src/app/services/login.service';
import { MigracionexcelService } from 'src/app/services/migracionexcel.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-libro-ventas',
  templateUrl: './libro-ventas.component.html',
  styleUrls: ['./libro-ventas.component.css']
})
export class LibroVentasComponent implements OnInit {
  tipoDocumento: any = [];
  unsubscribe$: any = new Subject();
  informacionForm!: FormGroup;
  protected token: any;
  protected UserIdentificado: any;
  constructor(private toast: ToastrService,
    private _MigrarInformacion: MigracionexcelService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private servicio_login: LoginService
  ) {
    this.token = this.servicio_login.getToken();
    this.UserIdentificado = this.servicio_login.getIdentity();
    this.route.data.subscribe((res: any) => {
      this.tipoDocumento = res.datos;
    })

    this.informacionForm = this.fb.group({
      fecha_desde: ['', Validators.required],
      fecha_hasta: ['', Validators.required],
      tipo_documento: ['']
    });

  }

  ngOnInit(): void {
    // Obtener la fecha actual
    const fechaActual = new Date();

    // Obtener la fecha de 1 mes antes
    const fechaUnMesAntes = new Date(fechaActual);
    fechaUnMesAntes.setMonth(fechaUnMesAntes.getMonth() - 1);
    // Formatear las fechas al formato "YYYY-MM-DD" para ponerlas en el formulario
    const fechaDesdeStr = formatoFecha(fechaUnMesAntes);
    const fechaHastaStr = formatoFecha(fechaActual);

    // Establecer las fechas en el formulario
    this.informacionForm.patchValue({
      fecha_desde: fechaDesdeStr,
      fecha_hasta: fechaHastaStr
    });
  }


  exportarDocumento() {
    this.informacionForm.markAllAsTouched()
    if (this.informacionForm.invalid) {
      return;
    }
    let myHeaders = new Headers();
    myHeaders.append("Authorization", this.token);
    let parameters = new FormData();
    parameters.append("id_usuario", this.UserIdentificado.sub);
    parameters.append("informacionForm", JSON.stringify(this.informacionForm.value));
    let requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      body: parameters,
    };
    Swal.fire({
      title: 'Libro Ventas',
      html: 'Exportando el excel ...',
      text: 'Exportando el excel ...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        fetch(environment.api_url + "?controller=LibroVentas&action=exportarLibroVentas", requestOptions)
          .then(response => response.blob())
          .then(blob => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = `Libro_Ventas_Documento.xlsx`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();
            Swal.close();
          })
          .catch(error => console.log('error', error));
      },
    });

  }

}
