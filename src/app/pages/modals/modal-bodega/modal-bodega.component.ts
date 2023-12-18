import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { BodegaService } from 'src/app/services/bodega.service';
declare var $: any;
@Component({
  selector: 'app-modal-bodega',
  templateUrl: './modal-bodega.component.html',
  styleUrls: ['./modal-bodega.component.css']
})
export class ModalBodegaComponent implements OnInit {
  @Output() respuesta = new EventEmitter<any>();
  @Input() texto_cabezera: string = '';
  @Input() accion: string = '';
  @Input() modulo: string = '';
  @Input() item: any;
  bodegaForm!: FormGroup;
  Unsuscribe: any = new Subject();
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private servicio_bodega: BodegaService,
  ) {
    this.bodegaForm = this.fb.group({
      id_bodega: [''],
      glosa_bodega: ['', [Validators.required]],
      accion: [''],
      modulo: ['']
    });
  }

  ngOnInit(): void {
  }
  llamarFuncionHijoDesdePadre(datos: any) {
    this.bodegaForm.get('accion')!.setValue(datos.accion);
    this.bodegaForm.get('id_bodega')!.setValue(datos.id_bodega ?? '');
    this.bodegaForm.get('glosa_bodega')!.setValue(datos.glosa_bodega ?? '');
    this.bodegaForm.get('modulo')!.setValue(datos.modulo ?? '');
  }



  GuardarActualizarBodega() {
    this.bodegaForm.markAllAsTouched()
    if (this.bodegaForm.invalid) {
      return;
    }
    this.servicio_bodega.gestionarBodega(this.bodegaForm.value).pipe(
      takeUntil(this.Unsuscribe)
      , finalize(() => {
        $('#exampleModalBodegaCenter').modal('hide');
        this.bodegaForm.reset();
      })).subscribe({
        next: (res: any) => {
          switch (this.bodegaForm.value.modulo) {
            case 'SUCURSAL':
              $("#exampleModalSucursal").modal('show');
              break;
          }
          this.respuesta.emit(res.datos);
          this.toastr.success(res.respuesta, undefined, {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        },
        error: (error) => {

        }
      })
  }

}
