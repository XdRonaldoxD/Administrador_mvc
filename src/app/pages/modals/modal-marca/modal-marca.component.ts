import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { MarcaService } from 'src/app/services/marca.service';

declare var $: any;
@Component({
  selector: 'app-modal-marca',
  templateUrl: './modal-marca.component.html',
  styleUrls: ['./modal-marca.component.css']
})
export class ModalMarcaComponent implements OnInit {
  @Output() respuesta = new EventEmitter<any>();
  @Input() texto_cabezera: string = '';
  @Input() accion: string = '';
  @Input() modulo: string = '';
  @Input() item: any;
  marcarForm!: FormGroup;
  Unsuscribe: any = new Subject();
  constructor(
    private servicio_marca: MarcaService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.marcarForm = this.fb.group({
      id_marca: [''],
      glosa_marca: ['', [Validators.required]],
      accion: [''],
      modulo: [''],
    });
  }

  ngOnInit(): void {
  }

  llamarFuncionHijoDesdePadre(datos: any) {
    this.marcarForm.get('accion')!.setValue(datos.accion);
    this.marcarForm.get('modulo')!.setValue(datos.modulo);
    this.marcarForm.get('id_marca')!.setValue(datos.id_marca ?? '');
    this.marcarForm.get('glosa_marca')!.setValue(datos.glosa_marca ?? '');
  }


  GuardarActualizarCategoria() {
    this.marcarForm.markAllAsTouched()
    if (this.marcarForm.invalid) {
      return;
    }
    this.servicio_marca.GestionarMarca(this.marcarForm.value).pipe(
      takeUntil(this.Unsuscribe)
      , finalize(() => {
        $('#exampleModalCenter').modal('hide');
        this.marcarForm.reset();
      })).subscribe({
        next: (res: any) => {
          this.respuesta.emit(res);
          let texto = 'creado';
          if (this.marcarForm.value.modulo == "MARCA") {
            texto = res;
          }
          this.toastr.success(`Marca ${texto} con exito`, undefined, {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        },
        error: (error) => {

        }
      })
  }

}
