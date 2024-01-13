import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-extended-pdf',
  templateUrl: './extended-pdf.component.html',
  styleUrls: ['./extended-pdf.component.css']
})
export class ExtendedPdfComponent implements OnInit {
  @Input('url_pdf') url_pdf:string='';
  constructor() { }

  ngOnInit(): void {
  }

}
