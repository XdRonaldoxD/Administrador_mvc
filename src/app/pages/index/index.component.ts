import { Component, Input, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  identificacion: any;
  constructor(
    private servicio_login: LoginService,
  ) {
    this.identificacion = this.servicio_login.getIdentity();
  }

  ngOnInit(): void {
    var elemento: any = document.querySelector("[data-dismiss='modal']");
    if (elemento) {
      elemento.click();
    }
  }

}
