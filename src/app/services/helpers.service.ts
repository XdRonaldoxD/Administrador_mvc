import { Injectable } from '@angular/core';
declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  resetPreview(name: string, src: string, fname = '') {
    let input = $('#' + name);
    let wrapper = input.closest('.dropify-wrapper');
    let preview = wrapper.find('.dropify-preview');
    let filename = wrapper.find('.dropify-filename-inner');
    let render = wrapper.find('.dropify-render').html('');

    input.val('').attr('title', fname);
    wrapper.removeClass('has-error').addClass('has-preview');
    filename.html(fname);

    render.append($('<img />').attr('src', src).css('max-height', input.data('height') || ''));
    preview.fadeIn();
  }

  initializeSummernoteEditor(id: any): void {
    $(`.${id}`).summernote({
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['codeview', ['codeview']],
        ['fullscreen', ['fullscreen']]
      ],
      height: 150,
      lang: "es-ES",
      callbacks: {
        onInit: function () {
          $(`#${id} div.note-editor button.btn-codeview`).click();
        }
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  validarNumeroDecimal(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue: string = inputElement.value;

    // Remover caracteres no permitidos (solo números y un punto decimal)
    inputValue = inputValue.replace(/[^0-9.]/g, '');

    // Separar parte entera y decimal
    const parts = inputValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';

    // Limitar la longitud de la parte decimal a dos caracteres
    const limitedDecimalPart = decimalPart.slice(0, 3);

    // Reconstruir el valor con la parte entera y la parte decimal limitada
    const finalValue: any = `${integerPart}${limitedDecimalPart}`;
    return finalValue;
  }

  getToolbarConfig(): any {
    return {
      toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ color: [] }, { 'background': [] }],
        [{ font: [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        
      ],
    };
  }



}
