import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  fechaActual: string;
  constructor(private datePipe: DatePipe) {
    this.fechaActual = this.obtenerFechaActual();
   }

  ngOnInit(): void {
  }

  obtenerFechaActual(): any {
    // Obtener la fecha actual utilizando DatePipe
    const fecha = new Date();
    const fecha_actual= this.datePipe.transform(fecha, 'yyyy');
    return fecha_actual;
  }

}
