import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, takeUntil, Subject } from 'rxjs';
import { LoginService } from '../../services/login.service';
declare var Swal: any;
declare var $: any;
declare var Pusher: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit ,OnDestroy {
  @ViewChild('agregar_mensaje') agregar_mensaje?: ElementRef;
  identificacion?: any = []
  construirMensaje: string = '';
  notficarChat: string = '';

  pipe = new DatePipe('en-US');
  token: any;
  cantidad_mensajes: number = 0;
  private unsubscribe$ = new  Subject<void>();
  constructor(
    private servicio_login: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Pusher.logToConsole = false;
    // const pusher = new Pusher('0900f1535d671035b532', {
    //   cluster: 'us2'
    // });
    // const channel = pusher.subscribe('ChatboxWoocommerce');
    // channel.bind('ChatboxOkaDatoClienteEvent', (element: any) => {
    //   // this.agregar_mensaje?.nativeElement.insertAdjacentHTML('beforeend', `<a href="/#/chatBox">
    //   // <div class="user-img"> <img src="assets/assets/images/users/1.jpg" alt="user" class="img-circle"> <span class="profile-status online pull-right"></span> </div>
    //   // <div class="mail-contnet">
    //   //     <h5>${element.nombre_log_chat}</h5><span class="mail-desc">${element.email_log_chat}</span><span class="time">${this.pipe.transform(element.fechacreacion_log_chat, 'shortDate')}</span> </div>
    //   // </a>`);
    //   // this.cantidad_mensajes++;
    // this.TraerChatLineaActivo();

    // });

    this.token = this.servicio_login.getToken();
    this.identificacion = this.servicio_login.getIdentity();
    $('[data-toggle="tooltip"]').tooltip();
    this.TraerChatLineaActivo();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete();
  }



  TraerChatLineaActivo() {
    this.servicio_login.TraerChatLineaActivo(this.token,true).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((resp) => {
      let html = ``;
      this.cantidad_mensajes = 0;
      resp.forEach((element: any) => {
        this.cantidad_mensajes++;
        html += `<a href="/#/chatBox">
        <div class="user-img"> <img src="assets/assets/images/users/1.jpg" alt="user" class="img-circle"> <span class="profile-status online pull-right"></span> </div>
        <div class="mail-contnet">
            <h5>${element.nombre_log_chat}</h5><span class="mail-desc">${element.email_log_chat}</span><span class="time">${this.pipe.transform(element.fechacreacion_log_chat, 'shortDate')}</span> </div>
        </a>`;
      });
      this.construirMensaje = html;
      if (this.cantidad_mensajes > 0) {
        this.notficarChat = `<span class="heartbit"></span> <span class="point"></span>`;
      } else {
        this.notficarChat = ``;

      }
    })
  }

  cerrarSession() {
    this.servicio_login.cerrarSession(this.identificacion.sub).pipe(
      takeUntil(this.unsubscribe$)
      ,finalize(() => {
      this.servicio_login.deleteSession();
      this.router.navigateByUrl('/IniciarSession').then();
    })).subscribe({
      next: (res) => {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: 'Cerrado Sessión con exito',
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      },
      error: (res) => {

      }
    })
  }

}
