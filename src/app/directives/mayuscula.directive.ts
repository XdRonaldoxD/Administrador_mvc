import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * [UI] Convierte a MAYÚSCULAS todo lo que se escribe en inputs de texto y textareas.
 *
 * Se aplica automáticamente (selector por elemento) a `input[type=text]` y `textarea`,
 * EXCEPTO:
 *  - Editores de texto enriquecido (summernote `.textarea_editor`, quill `.ql-editor`)
 *    — quedan tal cual, como pidió el usuario.
 *  - ng-select / combobox (`[role=combobox]`) — son buscadores, no datos.
 *  - Cualquier campo marcado con el atributo `mayusculaOff` (emails, URLs, códigos, etc.).
 *
 * Funciona tanto con Reactive Forms (formControlName) como con ngModel.
 */
@Directive({
  selector:
    'input[type="text"]:not([role="combobox"]):not([mayusculaOff]), textarea:not(.textarea_editor):not(.ql-editor):not([mayusculaOff])',
})
export class MayusculaDirective {
  constructor(
    @Optional() @Self() private ngControl: NgControl,
    private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    const valor = input.value;
    if (valor == null || valor === '') {
      return;
    }
    const mayus = valor.toUpperCase();
    if (mayus === valor) {
      return;
    }
    const pos = input.selectionStart;
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(mayus);
    } else {
      input.value = mayus;
    }
    try {
      input.setSelectionRange(pos, pos);
    } catch (e) {
      /* algunos input types no soportan setSelectionRange */
    }
  }
}
