import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LoginService } from '../../services/login.service';

declare var Swal: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  @ViewChild("EventoClick") EventoClick: ElementRef | undefined;
  identificacion?: any = []
  constructor(
    private servicio_login: LoginService,
    private router: Router

  ) {
    this.identificacion = this.servicio_login.getIdentity();
  }

  ngOnInit(): void {
  }
  SELECCION($evento: any) {
    for (let i = 0; i < this.EventoClick?.nativeElement.children.length; i++) {
      this.EventoClick?.nativeElement.children[i].firstElementChild.classList.remove('active');
    }
    $evento.classList.add('active');
  }



}
