import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { DatePipe } from '@angular/common';
declare var Pusher: any;
declare var $: any;
declare var Swal: any;
@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  @ViewChild('agregar_mensaje') agregar_mensaje?: ElementRef;
  @ViewChild('conversacion_chat') conversacion_chat?: ElementRef;

  ObtenerConversacion: any = [];
  token: any;
  usuario: any;
  pipe = new DatePipe('en-US');
  mensaje_area: string = '';
  identificadorcliente_log_chat: string = '';
  public removeEventListener: any;
  constructor(
    private servicio_login: LoginService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    Pusher.logToConsole = false;
    const pusher = new Pusher('5fd4b9d2fc8f70b057a0', {
      cluster: 'us2'
    });
    const channel = pusher.subscribe('ChatboxWoocommerce');
    channel.bind('ChatboxOkaDatoClienteEvent', (element: any) => {
      let linea = 'Desconectado';
      if (element.estado_linea_log_chat) {
        linea = 'linea';
      }
      this.agregar_mensaje?.nativeElement.insertAdjacentHTML('beforeend', `<li id=${element.id_log_chat}  (click)>
      <a    href="javascript:void(0)" class="selecciona_chat"><img 
              src="../../../assets/assets/images/users/avatar-staff.jpg" alt="user-img"
              class="img-circle"> <span  >${element.nombre_log_chat}
              <small   class="text-success" >${linea}  </small>
              <small   style="color: #398bf7;">${this.pipe.transform(element.fechacreacion_log_chat, 'short')} </small>
          </span></a>
      </li>`);
      this.ObtenerConversacion.push(element);


    });
    channel.bind('ChatboxEvent', (element: any) => {
      let html = '';
      let datos = this.ObtenerConversacion.find((res: any) => res.identificadorcliente_log_chat == element.identificadorcliente_log_chat)
      datos.conversacion_log_chat = element.conversacion_log_chat;
      if (datos.chat_seleccionado) {
        html = `<li class="reverse">
          <div class="chat-content">
              <h5>${datos.nombre_log_chat}</h5>
              <div class="box bg-light-inverse">${element.mensaje}</div>
          </div>
          <div class="chat-img"><img src="../../../assets/assets/images/users/avatar-staff.jpg" alt="user" /></div>
      </li>`;
        this.conversacion_chat?.nativeElement.insertAdjacentHTML('beforeend', html);
        $("#Messages").scrollTop(document.getElementById('Messages')?.scrollHeight);

      }
    });
    channel.bind('ChatboxOkaClienteDesconectadoEvent', (elementos: any) => {
      let datos = this.ObtenerConversacion.find((res: any) => res.identificadorcliente_log_chat == elementos.cliente_identificado)
      datos.estado_linea_log_chat = 0;
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'success',
        title: `Cliente ${datos.nombre_log_chat} desconectado.`,
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 5000
      })
      this.renderer.setProperty(this.agregar_mensaje?.nativeElement, 'innerHTML', '');
      this.ObtenerConversacion.forEach((element: any) => {
        let linea = 'Desconectado';
        let clase = 'text-warning';
        if (element.estado_linea_log_chat) {
          linea = 'linea';
          clase = 'text-success';
        }
        let active = '';
        if (element.chat_seleccionado == 1) {
          active = 'active';
        }
        this.agregar_mensaje?.nativeElement.insertAdjacentHTML('beforeend', `<li id=${element.id_log_chat}  (click)>
       <a href="javascript:void(0)" class="selecciona_chat ${active}"><img 
               src="../../../assets/assets/images/users/avatar-staff.jpg" alt="user-img"
               class="img-circle"> <span  >${element.nombre_log_chat}
               <small   class="${clase}" >${linea}  </small>
               <small   style="color: #398bf7;">${this.pipe.transform(element.fechacreacion_log_chat, 'short')} </small>
           </span></a>
       </li>`);
      });

    });


    this.token = this.servicio_login.getToken();
    this.usuario = this.servicio_login.getIdentity();

    this.TraerChatLineaActivo();
    //SE OBTIENE EL EVENTO CLICK PARA SACAR EL ID
    this.removeEventListener = this.renderer.listen(this.elementRef.nativeElement, 'click', (evt) => {
      this.navigate(evt);
    })
  }

  public ngOnDestroy() {
    this.removeEventListener();
  }

  navigate(evt: any) {
    let etiqueta = evt.target.closest('li');
    console.log(etiqueta);
    if (etiqueta !== null && etiqueta.hasAttribute('id')) {
      this.renderer.setProperty(this.conversacion_chat?.nativeElement, 'innerHTML', '');
      $(".selecciona_chat").removeClass('active');
      etiqueta.firstElementChild.classList.add('active');
      let id_log_chat = etiqueta.getAttribute('id');
      let datos = this.ObtenerConversacion.find((res: any) => res.id_log_chat == id_log_chat)
      this.identificadorcliente_log_chat = datos.identificadorcliente_log_chat;
      this.ObtenerConversacion.forEach((element: any) => {
        if (element.id_log_chat == id_log_chat) {
          element.chat_seleccionado = 1;
        } else {
          element.chat_seleccionado = 0;
        }
      });
      if (datos.conversacion_log_chat) {
        let html = '';
        let conversacion_log_chat = JSON.parse(datos.conversacion_log_chat);
        conversacion_log_chat.forEach((mensajes: any) => {
          if (mensajes.includes('cliente:')) {
            html = `<li class="reverse">
            <div class="chat-content">
                <h5>${datos.nombre_log_chat}</h5>
                <div class="box bg-light-inverse">${mensajes.replace('cliente:', '')}</div>
            </div>
            <div class="chat-img"><img src="../../../assets/assets/images/users/avatar-staff.jpg" alt="user" /></div>
        </li>`;
          } else {
            html += `<li>
            <div class="chat-img"><img src="../../../assets/assets/images/madrina-logo.png" alt="user" /></div>
            <div class="chat-content">
                <h5>Administrador</h5>
                <div class="box bg-light-info">${mensajes}</div>
            </div>
        </li>`;
          }
          this.conversacion_chat?.nativeElement.insertAdjacentHTML('beforeend', html);
        });
        $("#Messages").scrollTop(document.getElementById('Messages')?.scrollHeight);
      }

    }

  }

  TraerChatLineaActivo() {
    this.servicio_login.TraerChatLineaActivo(this.token).subscribe((resp) => {
      this.ObtenerConversacion = resp;
      resp.forEach((element: any) => {
        let linea = 'Desconectado';
        let clase = 'text-warning';
        if (element.estado_linea_log_chat) {
          linea = 'linea';
          clase = 'text-success';
        }
        this.agregar_mensaje?.nativeElement.insertAdjacentHTML('beforeend', `<li id=${element.id_log_chat}  (click)>
        <a    href="javascript:void(0)" class="selecciona_chat"><img 
                src="../../../assets/assets/images/users/avatar-staff.jpg" alt="user-img"
                class="img-circle"> <span  >${element.nombre_log_chat}
                <small   class="${clase}" >${linea}  </small>
                <small   style="color: #398bf7;">${this.pipe.transform(element.fechacreacion_log_chat, 'short')} </small>
            </span></a>
        </li>`);
      });
    })
  }

  Enviandoadmin(valor: any) {
    let texto: string;
    if (valor) {
      texto = valor.target.value;
    } else {
      texto = this.mensaje_area;
    }
    texto = texto.replace('\n', '')
    if (valor == null || valor.keyCode == '13') {
      this.mensaje_area = '';
      let conversacion = this.GuardarMensajeAdmin(this.identificadorcliente_log_chat, texto);
      this.servicio_login.ChatboxEventAdministrador(this.token, conversacion, this.identificadorcliente_log_chat, this.usuario.sub, texto).subscribe((resp) => {
        let html = `<li>
              <div class="chat-img"><img src="../../../assets/assets/images/madrina-logo.png" alt="user" /></div>
              <div class="chat-content">
                  <h5>Administrador</h5>
                  <div class="box bg-light-info">${texto}</div>
              </div>
          </li>`;
        this.conversacion_chat?.nativeElement.insertAdjacentHTML('beforeend', html);
        $("#Messages").scrollTop(document.getElementById('Messages')?.scrollHeight);
      })
    }


  }

  GuardarMensajeAdmin(cliente_identificado: any, mensaje: any) {
    let datos = this.ObtenerConversacion.find((res: any) => res.identificadorcliente_log_chat == cliente_identificado)
    let conversacion_log_chat;
    if (datos.conversacion_log_chat) {
      conversacion_log_chat = JSON.parse(datos.conversacion_log_chat);
      conversacion_log_chat.push(mensaje);
    } else {
      conversacion_log_chat = [mensaje];
    }
    datos.conversacion_log_chat = JSON.stringify(conversacion_log_chat);
    return conversacion_log_chat;
  }

  DesactivarCliente() {
    this.servicio_login.DesactivarCliente(this.token, this.identificadorcliente_log_chat).subscribe((resp: any) => {
      if (resp) {
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'success',
          title: `Cliente Desactviado Exitosamente.`,
          showConfirmButton: false,
          timerProgressBar: true,
          timer: 5000
        })
      }
      this.ObtenerConversacion = this.ObtenerConversacion.filter((res: any) => {
        if (res.identificadorcliente_log_chat === this.identificadorcliente_log_chat) {
          if (res.chat_seleccionado == 1) {
            this.renderer.setProperty(this.conversacion_chat?.nativeElement, 'innerHTML', '');
          }
        }
        if (res.identificadorcliente_log_chat !== this.identificadorcliente_log_chat) {
          return res;
        }
      })
      this.renderer.setProperty(this.agregar_mensaje?.nativeElement, 'innerHTML', '');


      this.ObtenerConversacion.forEach((element: any) => {
        let linea = 'Desconectado';
        let clase = 'text-warning';
        if (element.estado_linea_log_chat) {
          linea = 'linea';
          clase = 'text-success';
        }
        let active = '';
        if (element.chat_seleccionado == 1) {
          active = 'active';
        }
        this.agregar_mensaje?.nativeElement.insertAdjacentHTML('beforeend', `<li id=${element.id_log_chat}  (click)>
       <a href="javascript:void(0)" class="selecciona_chat ${active}"><img 
               src="../../../assets/assets/images/users/avatar-staff.jpg" alt="user-img"
               class="img-circle"> <span  >${element.nombre_log_chat}
               <small   class="${clase}" >${linea}  </small>
               <small   style="color: #398bf7;">${this.pipe.transform(element.fechacreacion_log_chat, 'short')} </small>
           </span></a>
       </li>`);
      });
    })
  }



}
