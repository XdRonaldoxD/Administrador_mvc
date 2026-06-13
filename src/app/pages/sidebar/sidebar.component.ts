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

      // [FIX] Mantenemos el MISMO modelo que el accordion del template (AdminMenu/
      // metisMenu): grupo abierto = <li>.active + <ul class="collapse in">; cerrado =
      // sin esas clases. metisMenu decide expandir/colapsar leyendo <li>.active, así
      // que si tocáramos la clase en otro lado su estado se desincroniza y el menú
      // queda "congelado". Por eso operamos sobre el <li> del grupo, no sobre el <a>.
      nav.querySelectorAll('ul.collapse').forEach((ul) => {
        ul.classList.remove('in');
        ul.setAttribute('aria-expanded', 'false');
        const li = ul.parentElement;
        if (li) {
          li.classList.remove('active');
        }
        const header = li ? li.querySelector('a.has-arrow') : null;
        if (header) {
          header.setAttribute('aria-expanded', 'false');
        }
      });

      // El ítem activo lo marca routerLinkActive; abrimos solo su grupo contenedor.
      const activo = nav.querySelector('a.desactivar.active');
      if (!activo) {
        return;
      }
      const grupoUl = activo.closest('ul.collapse');
      if (!grupoUl) {
        return;
      }
      grupoUl.classList.add('in');
      grupoUl.setAttribute('aria-expanded', 'true');
      const grupoLi = grupoUl.parentElement;
      if (grupoLi) {
        grupoLi.classList.add('active');
        const header = grupoLi.querySelector('a.has-arrow');
        if (header) {
          header.setAttribute('aria-expanded', 'true');
        }
      }
    });
  }
  Seleccionar(_evento?: any) {
    // El resaltado del ítem activo lo gestiona routerLinkActive (en la plantilla);
    // aquí solo cerramos el sidebar en móvil al elegir una opción.
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
