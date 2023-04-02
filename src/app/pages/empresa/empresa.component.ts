import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { CategoriaService } from 'src/app/services/categoria.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import { NotaVenta } from 'src/app/services/notaventa.service';
import { LoginService } from 'src/app/services/login.service';

import Swal from 'sweetalert2';
import { HelpersService } from 'src/app/services/helpers.service';

declare const window: Window;
declare var $: any;
@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('ruc_empresa') ruc_empresa?: ElementRef;
  @ViewChild("icono_empresa") icono_empresa?: ElementRef;
  @ViewChild("logo_empresa_horizonta") logo_empresa_horizonta?: ElementRef;
  @ViewChild("logo_empresa_vertical") logo_empresa_vertical?: ElementRef;


  token: any;
  fechaActual: any = new Date();

  glosa_global_producto: any;
  path_global_producto: any;
  listarProductoRelacionados: any = [];
  informacionForm!: FormGroup;
  PrecioStockForm!: FormGroup;
  archivo_certificado: any = null;
  departamentos: any = [];
  distritos: any = [];
  provincias: any = [];
  listacertificados: any = [];
  unsubscribe$: any = new Subject();
  color: any;
  usuario: any = null;

  constructor(

    private servicio_login: LoginService,
    private fb: FormBuilder,
    private nota_venta: NotaVenta,
    private empresa: EmpresaService,
    private toast: ToastrService,
    private Helper: HelpersService
  ) {
    let mes = this.fechaActual.getMonth() + 1;
    if (mes < 10) {
      mes = `0${mes}`;
    }
    let dia = this.fechaActual.getDate();
    if (dia < 10) {
      dia = `0${dia}`;
    }

    let segundo = this.fechaActual.getSeconds();
    if (segundo < 10) {
      segundo = `0${segundo}`;
    }

    this.fechaActual = this.fechaActual.getFullYear() + '-' + mes + '-' + dia + ' ' + this.fechaActual.getHours() + ':' + this.fechaActual.getMinutes() + ':' + segundo;

  }

  ngOnDestroy(): void {
    this.unsubscribe$.unsubscribe();
  }

  ngOnInit(): void {
    this.usuario = this.servicio_login.getIdentity();
    this.TraerDepartamento();
    this.informacionForm = this.fb.group({
      id_empresa_venta_online: [],
      ruc_empresa: ['', [Validators.required]],
      razon_social_empresa: ['', [Validators.required]],
      nombre_empresa: [''],
      telefono_empresa: [''],
      celular_empresa: [''],
      email_empresa_venta_online: ['', [Validators.required]],
      giro_empresa_venta_online: ['', [Validators.required]],
      direccion_empresa: ['', [Validators.required]],
      departamento: ['', [Validators.required]],
      distrito: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      usuario_sol: [''],
      clave_sol: [''],
      clave_archivo: [''],
      pixelgoogle_empresa: [''],
      pixelfacebook_empresa: [''],
      dominio: [window.location.hostname],
      serie_factura: [''],
      serie_boleta: [''],
    });
    $('.dropify').dropify({
      messages: {
        default: 'Arrastre y suelte un archivo aquí o haga clic en',
        replace: 'Arrastre y suelte un archivo o haga clic para reemplazar',
        remove: 'Eliminar',
        error: 'Lo siento, el archivo es demasiado grande.'
      }
    });
  }

  SerieFactura(event:any):any {
    console.log(event.target.value);
    let texto=event.target.value;
    
     "F"+event.target.value;
  }

  TraerCertificadoEmpresa() {
    this.empresa.TraerCertificadoEmpresa(this.informacionForm.value.id_empresa_venta_online).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.listacertificados = resp;
      },
      error: error => {

      }
    })

  }
  DescargarCertificado(id_certificado_digital: number): void {

  }
  eliminarCertificado(id_certificado_digital: number): void {

  }

  ngAfterViewInit(): void {
    this.Helper.initializeSummernoteEditor('pixelgoogle_empresa');
    this.Helper.initializeSummernoteEditor('pixelfacebook_empresa');
    $('.pixelgoogle_empresa').summernote('code', '');
    $('.pixelfacebook_empresa').summernote('code', '');

    this.empresa.TraerEmpresa().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        if (resp) {
          if (resp.idDepartamento) {
            this.SeleccionarDepartamento(resp.idDepartamento);
          }
          if (resp.idProvincia) {
            this.SeleccionarProvincia(resp.idProvincia);
          }
          this.informacionForm.patchValue({
            ruc_empresa: resp.ruc_empresa_venta_online,
            razon_social_empresa: resp.razon_social_empresa_venta_online,
            id_empresa_venta_online: resp.id_empresa_venta_online,
            telefono_empresa: resp.telefono_empresa_venta_online,
            celular_empresa: resp.celular_empresa_venta_online,
            direccion_empresa: resp.direccion_empresa_venta_online,
            departamento: resp.idDepartamento ? `${resp.idDepartamento}` : '',
            distrito: resp.idDistrito ? `${resp.idDistrito}` : '',
            provincia: resp.idProvincia ? `${resp.idProvincia}` : '',
            usuario_sol: resp.usuariosol_venta_online,
            clave_sol: resp.clavesol_venta_online,
            clave_archivo: resp.clavearchivo_venta_online,
            pixelgoogle_empresa: resp.pixelgoogle_empresa_venta_online,
            pixelfacebook_empresa: resp.pixelfacebook_empresa_venta_online,
            nombre_empresa: resp.nombre_empresa_venta_online,
            email_empresa_venta_online: resp.email_empresa_venta_online,
            giro_empresa_venta_online: resp.giro_empresa_venta_online
          });
          $('.pixelgoogle_empresa').summernote('code', resp.pixelgoogle_empresa_venta_online);
          $('.pixelfacebook_empresa').summernote('code', resp.pixelfacebook_empresa_venta_online);
          this.Helper.resetPreview('icono_empresa', resp.urlicono_empresa_venta_online, resp.public_idicono_empresa_venta_online);
          this.Helper.resetPreview('logo_empresa_horizonta', resp.urllogohorizontal_empresa_venta_online, resp.public_idlogohorizontal_empresa_venta_online);
          this.Helper.resetPreview('logo_empresa_vertical', resp.urllogovertical_empresa_venta_online, resp.public_idlogovertical_empresa_venta_online);
        }

      },
      error: error => {

      }
    })
    //  // Llenar los datos del formulario


  }



  TraerDepartamento() {
    this.nota_venta.TraerDepartamento().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.departamentos = resp;
      }, error: error => {
        this.departamentos = [];
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `Error con el departamento.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
        });
      }
    });
  }


  onFileSelected(event: any): void {
    const archivo = event.target.files[0];
    this.archivo_certificado = archivo;
  }

  GuardarInformacionCompleto(): void {
    console.log(this.archivo_certificado);
    var pixelgoogle_empresa = $('.pixelgoogle_empresa').summernote('code');
    var pixelfacebook_empresa = $('.pixelfacebook_empresa').summernote('code');
    if (pixelgoogle_empresa === "<p><br></p>" || pixelfacebook_empresa === '<p><br></p>') {
      pixelgoogle_empresa = '';
      pixelfacebook_empresa = '';
    }
    this.informacionForm.get('pixelgoogle_empresa')!.setValue(pixelgoogle_empresa.trim());
    this.informacionForm.get('pixelfacebook_empresa')!.setValue(pixelfacebook_empresa.trim());
    this.informacionForm.markAllAsTouched()
    if (this.informacionForm.invalid) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'error',
        title: 'Completar los campos obligatorios.',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      return;
    }

    let icono_empresa = null;
    let logo_empresa_horizonta = null;
    let logo_empresa_vertical = null;
    if (this.icono_empresa?.nativeElement.files.length > 0) {
      icono_empresa = this.icono_empresa?.nativeElement.files[0];
    }
    if (this.logo_empresa_horizonta?.nativeElement.files.length > 0) {
      logo_empresa_horizonta = this.logo_empresa_horizonta?.nativeElement.files[0];
    }
    if (this.logo_empresa_vertical?.nativeElement.files.length > 0) {
      logo_empresa_vertical = this.logo_empresa_vertical?.nativeElement.files[0];
    }
    let imagenes = {
      icono_empresa: icono_empresa,
      logo_empresa_horizonta: logo_empresa_horizonta,
      logo_empresa_vertical: logo_empresa_vertical
    }

    this.empresa.EnviarInformacionEmpresa(this.informacionForm.value, this.archivo_certificado, imagenes).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.informacionForm.get('id_empresa_venta_online')?.setValue(resp);
        if (!this.usuario.id_empresa) {
          this.usuario.id_empresa = resp;
          this.servicio_login.saveIdentity(this.usuario);
        }
        this.TraerCertificadoEmpresa();
        this.toast.success('Actualizado Correctamente', 'Empresa', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });

      }, error: error => {
        this.toast.error(error.error, '', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
        });
        return;
      }
    })

  }



  SeleccionarDepartamento(departamento: any) {
    let id_departamento = this.informacionForm.value.departamento;
    if (departamento) {
      id_departamento = departamento;
    }
    console.log(id_departamento);
    this.nota_venta.TraerProvincia(id_departamento).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.provincias = resp;
      }, error: error => {
        this.departamentos = [];
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `Error con el departamento.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
        });
      }
    });
  }
  SeleccionarProvincia(provincia: any) {
    let id_provincia = this.informacionForm.value.provincia;
    if (provincia) {
      id_provincia = provincia;
    }
    this.nota_venta.TraerDistrito(id_provincia).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: resp => {
        this.distritos = resp;
      }, error: error => {
        this.departamentos = [];
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'error',
          title: `Error con el distrito.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 3000,
        });
      }
    });
  }





}
