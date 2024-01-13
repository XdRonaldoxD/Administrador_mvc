import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../../services/login.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild("EventoClick") EventoClick: ElementRef | undefined;
  identificacion?: any = []
  constructor(
    private servicio_login: LoginService

  ) {
    this.identificacion = this.servicio_login.getIdentity();
  }

  ngOnInit(): void {
  }
  Seleccionar($evento: any) {
    for (let i = 0; i < this.EventoClick?.nativeElement.children.length; i++) {
      this.EventoClick?.nativeElement.children[i].firstElementChild.classList.remove('active');
    }
    $(".desactivar").removeClass('active');
    $evento.classList.add('active');
    this.ocultarSidebarMobil();
  }

  ocultarSidebarMobil() {
    if (window.innerWidth <= 767) {
      let tiMenuElement: any = document.querySelector('.ti-menu');
      let navItemElement: any = document.querySelector('.nav-link');
      if (tiMenuElement) {
        navItemElement.click();
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Llamamos a la función cuando cambia el tamaño de la ventana
    this.ocultarSidebarMobil();
  }



}
