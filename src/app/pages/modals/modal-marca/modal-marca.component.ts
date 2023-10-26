import { Component, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, finalize, takeUntil } from 'rxjs';
import { MarcaService } from 'src/app/services/marca.service';
import { EventEmitter } from '@angular/core';

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
  @Input() item: any;

  marcarForm!: FormGroup;
  Unsuscribe: any = new Subject();
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private servicio_marca: MarcaService
  ) {
    this.marcarForm = this.fb.group({
      id_marca: [''],
      glosa_marca: ['', [Validators.required]],
      accion: [''],
    });
 
  }

  ngOnInit(): void {
   
  }

  GuardarActualizarCategoria() {
    this.marcarForm.get('accion')?.setValue(this.accion);
    this.marcarForm.get('id_marca')?.setValue(this.item.id_marca);
    this.marcarForm.markAllAsTouched()
    if (this.marcarForm.invalid) {
      return;
    }
    this.servicio_marca.GestionarMarca(this.marcarForm.value).pipe(
      takeUntil(this.Unsuscribe)
      , finalize(() => {
        $('#exampleModalCenter').modal('hide');
      })).subscribe({
        next: (res) => {
          this.respuesta.emit(res.data);
          this.toastr.success(`Marca ${res.respuesta} con exito`, undefined, {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        },
        error: (error) => {
          this.toastr.success(`Marca ${error}`, undefined, {
            timeOut: 3000,
            positionClass: 'toast-top-right',
          });
        }
      })


  }

}
