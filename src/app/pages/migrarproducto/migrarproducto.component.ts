import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { MigracionexcelService } from 'src/app/services/migracionexcel.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-migrarproducto',
  templateUrl: './migrarproducto.component.html',
  styleUrls: ['./migrarproducto.component.css']
})
export class MigrarproductoComponent implements OnInit {
  @ViewChild('mensaje') mensaje: ElementRef | any;
  token: any;
  identity: any;
  archivos: any = null;
  imgTemporal: string = '';
  validar: boolean = false;
  texto: string = '';
  accion_cargar: string = 'CREAR';
  constructor(
    private _loginServicio: LoginService,
    private _MigrarInformacion: MigracionexcelService
  ) { }

  ngOnInit(): void {
    this.token = this._loginServicio.getToken();
    this.identity = this._loginServicio.getIdentity();

  }


  ExportarProducto() {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", this.token);
    var requestOptions: any = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    Swal.fire({
      title: 'Productos',
      html: 'Exportando el excel ...',
      text: 'Exportando el excel ...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        fetch(environment.api_url+"?controller=ProductoExcel&action=ExportarDatos", requestOptions)
          .then(response => response.blob())
          .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;

            a.download = `Inventario_Producto.xlsx`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();
            Swal.close();
          })
          .catch(error => console.log('error', error));
      },
    });
  }

  ExportarPlantillaProducto() {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", this.token);
    var requestOptions: any = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    Swal.fire({
      title: 'Productos',
      html: 'Exportando el excel ...',
      text: 'Exportando el excel ...',
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        Swal.showLoading();
        fetch(environment.api_url+"?controller=ProductoExcel&action=ExportarPlantilla", requestOptions)
          .then(response => response.blob())
          .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = `Plantilla_Producto.xlsx`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();
            Swal.close();
          })
          .catch(error => console.log('error', error));
      },
    });
  }


  

  DetectarTipoAccion(e: any) {
    if (e.currentTarget.checked) {
      this.accion_cargar = 'ACTUALIZAR';
      this.mensaje.nativeElement.classList.remove('d-none');
    } else {
      this.accion_cargar = 'CREAR';
      this.mensaje.nativeElement.classList.add('d-none');
    };
  }

  EnviarProducto(datos: any) {
    if (this.archivos !== null) {
      Swal.fire({
        title: 'Producto',
        html: 'Cargando el excel ...',
        text: 'Cargando el excel ...',
        allowOutsideClick: false,
        showConfirmButton: false,
        onOpen: () => {
          Swal.showLoading();
          this._MigrarInformacion
            .EnviarArchivoProducto(this.archivos, this.accion_cargar, this.identity.sub)
            .subscribe({
              next: (data): any => {
                if (data.respuesta === "Error columna") {
                  Swal.fire({
                    toast: true,
                    position: 'top',
                    icon: 'error',
                    title: `Error en la columna del Excel.`,
                    showConfirmButton: false,
                    timerProgressBar: true,
                    timer: 3000,
                  });
                  datos.reset();
                  this.archivos = null;
                  return false;
                }

                if (data.validandoExcel.length > 0) {
                  Swal.close();
                  let html = ``;
                  data.validandoExcel.forEach((element: any, index: any) => {
                    html += '<tr>';
                    // html += `<td>${index+1}</td>`;
                    html += `<td>${element.fila}</td>`;
                    html += `<td>${element.columna}</td>`;
                    html += `<td class="text-danger">${element.comentario}</td>`;
                    html += '</tr>';
                  });
                  $('.ValidarExcel').html(html);
                  $('.validarColumnas').removeClass('d-none');
                  $('#modal_datos').modal('show');
                  $('.texto_principal').html('Campos Vacios del Excel.');
                  $('.error_producto').addClass('d-none');
                } else if (data.datosexistente.length > 0) {
                  Swal.close();
                  let html = ``;
                  data.datosexistente.forEach((element: any, index: any) => {
                    html += '<tr>';
                    html += `<td>${element.fila}</td>`;
                    let ColumnasDato = element.columna.split('~');
                    ColumnasDato.forEach((element: any) => {
                      html += `<td>${element}</td>`;
                    });
                    html += `<td class="text-danger">${element.comentario}</td>`;
                    html += '</tr>';
                  });
                  $('.producto_sin_registro').html(html);
                  $('.validarColumnas').addClass('d-none');
                  $('.existe_producto').removeClass('d-none');

                  $('#modal_datos').modal('show');
                  $('.texto_principal').html('Validando Excel.');
                  $('.error_producto').addClass('d-none');
                } else {
                  Swal.close();
                  if (this.accion_cargar == "CREAR") {
                    Swal.fire(
                      `Migrado Exitosamente los Productos.`,
                      '',
                      'success'
                    );
                  } else {
                    Swal.fire(
                      `Actualizado Exitosamente los Productos.`,
                      '',
                      'success'
                    );
                  }
                }
                datos.reset();
                this.archivos = null;
              }, error: (error) => {

              }
            });

        },
      });
    } else {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: `Seleccione el Archivo.`,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 3000,
      });
    }
  }

  seleccioneExcel(imagen: any) {
    if (!imagen.files[0]) {
      Swal.fire(
        "Error",
        "No se ha seleccionado ningún archivo.",
        "error"
      );
      Swal.fire(
        "Sólo Excel",
        "No se ha seleccionado ningún archivo.",
        "error"
      );
      return;
    }
    let archivos = this.extencionDeArchivo(imagen.files[0].name);
    let validando_excel = true;
    if (archivos === 'xlsx' || archivos === 'xlsm' || archivos === 'xlsb' || archivos === 'xltx') {
      validando_excel = false;
    }
    if (validando_excel) {
      Swal.fire(
        "Sólo Excel",
        "El Archivo seleccionado no es un excel.",
        "error"
      );
      this.archivos = null;
      return;
    }

    this.archivos = imagen.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      this.imgTemporal = reader.result as string;
    };
    reader.readAsDataURL(this.archivos); 
  }

  extencionDeArchivo(filename: any) {
    return filename.split('.').pop();
  }
}
