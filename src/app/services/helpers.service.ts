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
}
