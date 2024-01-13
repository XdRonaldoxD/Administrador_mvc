import { Component, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { LoginService } from './services/login.service';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';


declare var $: any;
declare var jQuery: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AdminCarritoCompras';
  screen: any;
  value: any;
  href: any;
  Unsuscribe: any = new Subject();

  constructor(
    private elementRef: ElementRef,
    private Login: LoginService,
    private titleService: Title,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    var elemento: any = document.querySelector("[data-dismiss='modal']");
    if (elemento) {
      elemento.click();
    }
    // this.Login.TraerIconoEmpresa().pipe(takeUntil(this.Unsuscribe)).subscribe({
    //   next: resp => {
    //     //INICIALIZAMOS EL ICONO
    //     if (resp.nombre_empresa) {
    //       this.titleService.setTitle(resp.nombre_empresa)
    //     }
    //     if (resp.icono) {
    //       const head = document.head || document.getElementsByTagName('head')[0];
    //       const linkElement = document.createElement('link');
    //       linkElement.rel = 'icon';
    //       linkElement.type = 'image/x-icon';
    //       linkElement.href = resp.icono;
    //       const existingLink = head.querySelector('link[rel="icon"]');
    //       if (existingLink) {
    //         head.removeChild(existingLink);
    //       }
    //       head.appendChild(linkElement);
    //     }
    //     //-----------------------------
    //   }, error: error => {
    //   }
    // })
    $(() => {
      "use strict";
      $(function () {
        $(".preloader").fadeOut();
      }), jQuery(document).on("click", ".mega-dropdown", function (e: any) {
        e.stopPropagation();
      });
      var set = () => {
        (window.innerWidth > 0 ? window.innerWidth : this.screen.width) < 1170 ? ($("body").addClass("mini-sidebar"),
          $(".navbar-brand span").hide(), $(".sidebartoggler i").addClass("ti-menu")) : ($("body").removeClass("mini-sidebar"),
            $(".navbar-brand span").show());
        var height = (window.innerHeight > 0 ? window.innerHeight : this.screen.height) - 1;
        (height -= 0) < 1 && (height = 1), height > 0 && $(".page-wrapper").css("min-height", height + "px");
      };
      $(window).ready(set), $(window).on("resize", set), $(".sidebartoggler").on("click", function () {
        $("body").hasClass("mini-sidebar") ? ($("body").trigger("resize"), $("body").removeClass("mini-sidebar"),
          $(".navbar-brand span").show()) : ($("body").trigger("resize"), $("body").addClass("mini-sidebar"),
            $(".navbar-brand span").hide());
      }), $(".nav-toggler").click(function () {
        $("body").toggleClass("show-sidebar"), $(".nav-toggler i").toggleClass("ti-menu"),
          $(".nav-toggler i").addClass("ti-close");
      }), $(".search-box a, .search-box .app-search .srh-btn").on("click", function () {
        $(".app-search").toggle(200);
      }), $(".right-side-toggle").click(function () {
        $(".right-sidebar").slideDown(50), $(".right-sidebar").toggleClass("shw-rside");
      }), $(".floating-labels .form-control").on("focus blur", (e: any) => {
        $(this).parents(".form-group").toggleClass("focused", "focus" === e.type || this.value.length > 0);
      }).trigger("blur"), $(() => {
        for (var url = window.location, element = $("ul#sidebarnav a").filter(() => {
          return this.href == url;
        }).addClass("active").parent().addClass("active"); ;) {
          if (!element.is("li")) break;
          element = element.parent().addClass("in").parent().addClass("active");
        }
      }), $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      }), $(function () {
        $('[data-toggle="popover"]').popover();
      }), $(function () {
        $("#sidebarnav").AdminMenu();
      }), $(".scroll-sidebar, .right-side-panel, .message-center, .right-sidebar").perfectScrollbar(),
        $("body").trigger("resize"), $(".list-task li label").click(() => {
          $(this).toggleClass("task-done");
        }), $('a[data-action="collapse"]').on("click", (e: any) => {
          e.preventDefault(), $(this).closest(".card").find('[data-action="collapse"] i').toggleClass("ti-minus ti-plus"),
            $(this).closest(".card").children(".card-body").collapse("toggle");
        }), $('a[data-action="expand"]').on("click", (e: any) => {
          e.preventDefault(), $(this).closest(".card").find('[data-action="expand"] i').toggleClass("mdi-arrow-expand mdi-arrow-compress"),
            $(this).closest(".card").toggleClass("card-fullscreen");
        }), $('a[data-action="close"]').on("click", () => {
          $(this).closest(".card").removeClass().slideUp("fast");
        });
    });

  }


  // @HostListener('window:beforeunload', ['$event'])
  // beforeUnloadHandler(event: any) {
  //   event.preventDefault();
  //   event.returnValue = '';
  //   localStorage.removeItem("UserIdentificado");
  // }

  // @HostListener('visibilitychange', ['$event'])
  // visibilityChangeHandler(event: any) {
  //   if (document.visibilityState === 'hidden') {
  //     localStorage.removeItem("UserIdentificado");
  //   }
  // }
}
