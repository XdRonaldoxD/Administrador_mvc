import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { PermisoService } from '../../services/permiso.service';

declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("EventoClick") EventoClick: ElementRef | undefined;
  identificacion?: any = []
  private rutaSub?: Subscription;
  constructor(
    private servicio_login: LoginService,
    private router: Router,
    public permiso: PermisoService
  ) {
    this.identificacion = this.servicio_login.getIdentity();
  }

  ngOnInit(): void {
    // [PERMISOS] Carga/refresca los módulos permitidos del usuario actual.
    // Quedan cacheados (localStorage) para que el menú y el PermisoGuard
    // los usen al instante en las siguientes navegaciones/refrescos.
    this.permiso.cargarMisModulos().subscribe({
      // Al refrescar la lista de módulos el menú se vuelve a renderizar:
      // re-sincronizamos el grupo/ítem activo con la ruta actual.
      next: () => this.sincronizarMenu(this.router.url),
      error: () => {},
    });
  }

  ngAfterViewInit(): void {
    // [FIX] El template (custom.js) marca el menú activo solo en document.ready,
    // que en una SPA corre antes de renderizar el sidebar y no se repite al
    // navegar/recargar. Aquí lo sincronizamos con la ruta al iniciar y en cada
    // navegación, expandiendo el grupo correcto y resaltando el ítem.
    this.sincronizarMenu(this.router.url);
    this.rutaSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => this.sincronizarMenu((e as NavigationEnd).urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.rutaSub?.unsubscribe();
  }

  /**
   * Abre el grupo del ítem activo. El resaltado del ítem (.active) lo gestiona
   * `routerLinkActive` en la plantilla (fiable al navegar y al recargar); aquí solo
   * expandimos el grupo que lo contiene y colapsamos los demás. Se usa setTimeout
   * para correr después de que Angular aplique routerLinkActive en el ciclo actual.
   */
  private sincronizarMenu(_url?: string): void {
    setTimeout(() => {
      const nav = document.querySelector('#sidebarnav');
      if (!nav) {
        return;
      }

      // Colapsa todos los grupos y limpia el "activo" de las cabeceras.
      nav.querySelectorAll('ul.collapse').forEach((el) => {
        el.classList.remove('in');
        el.setAttribute('aria-expanded', 'false');
      });
      nav.querySelectorAll('a.has-arrow.active').forEach((el) => el.classList.remove('active'));

      // El ítem activo lo marca routerLinkActive; abrimos su grupo contenedor.
      const activo = nav.querySelector('a.desactivar.active');
      if (!activo) {
        return;
      }
      const grupoUl = activo.closest('ul.collapse');
      if (grupoUl) {
        grupoUl.classList.add('in');
        grupoUl.setAttribute('aria-expanded', 'true');
        const cabecera = grupoUl.parentElement
          ? grupoUl.parentElement.querySelector('a.has-arrow')
          : null;
        if (cabecera) {
          cabecera.setAttribute('aria-expanded', 'true');
          cabecera.classList.add('active');
        }
      }
    });
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
      let elementosConShowSidebar: NodeListOf<Element> = document.querySelectorAll('.show-sidebar');
      elementosConShowSidebar.forEach(elemento => {
        elemento.classList.remove('show-sidebar');
      });
      document.querySelectorAll('i.ti-close').forEach(function(iconoTiClose) {
        iconoTiClose.classList.remove('ti-close');
        iconoTiClose.classList.add('ti-menu');
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Llamamos a la función cuando cambia el tamaño de la ventana
    this.ocultarSidebarMobil();
  }



}
