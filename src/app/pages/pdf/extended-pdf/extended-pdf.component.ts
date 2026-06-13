import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-extended-pdf',
  templateUrl: './extended-pdf.component.html',
  styleUrls: ['./extended-pdf.component.css']
})
export class ExtendedPdfComponent implements OnInit {
  @Input('url_pdf') url_pdf:string='';
  // [PDF] Zoom inicial del visor. A4 usa 'page-width'; el TICKET (muy angosto)
  // se ve enorme con 'page-width', por eso se le pasa un zoom fijo (100).
  @Input('zoom') zoom: any = 'page-width';
  constructor() { }

  ngOnInit(): void {
  }

}
