import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Input } from '@angular/core';
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
  @Input('empresa') empresa:any;
  identificacion?: any = []
  construirMensaje: string = '';
  notficarChat: string = '';

  pipe = new DatePipe('en-US');
  token: any;
  cantidad_mensajes: number = 0;
  // [LOGO] Imagen por defecto si la empresa no tiene logo horizontal cargado.
  logoDefault = 'assets/img/iconorosa.png';
  private unsubscribe$ = new  Subject<void>();
  constructor(
    private servicio_login: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    Pusher.logToConsole = false;
    const pusher = new Pusher('0900f1535d671035b532', {
      cluster: 'us2'
    });
    const channel = pusher.subscribe('ChatboxWoocommerce');
    channel.bind('ChatboxOkaDatoClienteEvent', (element: any) => {
      // this.agregar_mensaje?.nativeElement.insertAdjacentHTML('beforeend', `<a href="/#/chatBox">
      // <div class="user-img"> <img src="assets/assets/images/users/1.jpg" alt="user" class="img-circle"> <span class="profile-status online pull-right"></span> </div>
      // <div class="mail-contnet">
      //     <h5>${element.nombre_log_chat}</h5><span class="mail-desc">${element.email_log_chat}</span><span class="time">${this.pipe.transform(element.fechacreacion_log_chat, 'shortDate')}</span> </div>
      // </a>`);
      // this.cantidad_mensajes++;
    this.TraerChatLineaActivo();

    });

    this.token = this.servicio_login.getToken();
    this.identificacion = this.servicio_login.getIdentity();
    $('[data-toggle="tooltip"]').tooltip();
    this.TraerChatLineaActivo();
  }

  // [LOGO] Logo de la empresa (horizontal). Si no hay, usa la imagen por defecto.
  get logoEmpresa(): string {
    const url = this.identificacion?.urllogohorizontal_empresa_venta_online;
    return url ? url : this.logoDefault;
  }

  // Si la URL del logo no carga (404/rota), cae al logo por defecto.
  onLogoError(ev: any): void {
    if (ev?.target) {
      ev.target.src = this.logoDefault;
    }
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
        // [SEGURIDAD C7] Escapar datos del cliente antes de inyectarlos como HTML
        // ([innerHTML]). Sin esto, un nombre/email con <img onerror=...> ejecuta JS
        // en la sesión del administrador (robo de token).
        html += `<a href="/#/chatBox">
        <div class="user-img"> <img src="assets/assets/images/users/1.jpg" alt="user" class="img-circle"> <span class="profile-status online pull-right"></span> </div>
        <div class="mail-contnet">
            <h5>${this.escapeHtml(element.nombre_log_chat)}</h5><span class="mail-desc">${this.escapeHtml(element.email_log_chat)}</span><span class="time">${this.pipe.transform(element.fechacreacion_log_chat, 'shortDate')}</span> </div>
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

  // [SEGURIDAD C7] Escapa caracteres HTML peligrosos de datos no confiables.
  private escapeHtml(value: any): string {
    if (value === null || value === undefined) { return ''; }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
