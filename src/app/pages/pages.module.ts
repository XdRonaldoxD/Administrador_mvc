import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesComponent } from './pages.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { IndexComponent } from './index/index.component';
import { IsInvalidPipe } from './pipes/is-invalid.pipe';
import { HasErrorPipe } from './pipes/has-error.pipe';
import { PAGES_ROUTES } from './pages.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NuevoProductoComponent } from './nuevo-producto/nuevo-producto.component';
import { ProductosComponent } from './productos/productos.component';
import { DataTablesModule } from 'angular-datatables';
import { PerfilComponent } from './perfil/perfil.component';
import { MarcasComponent } from './marcas/marcas.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { AtributoComponent } from './atributos/atributo.component';
import { TooltipModule } from 'ng2-tooltip-directive';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidoDetalleComponent } from './pedido-detalle/pedido-detalle.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { MigrarproductoComponent } from './migrarproducto/migrarproducto.component';
import { NotaVentaComponent } from './nota-venta/nota-venta.component';
import { CajaComponent } from './caja/caja.component';
import { VentasComponent } from './ventas/ventas.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SliderComponent } from './TiendaOnline/slider/slider.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { BannerComponent } from './TiendaOnline/banner/banner.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    IndexComponent,
    IsInvalidPipe,
    HasErrorPipe,
    PagesComponent,
    SidebarComponent,
    NuevoProductoComponent,
    ProductosComponent,
    PerfilComponent,
    MarcasComponent,
    CategoriaComponent,
    AtributoComponent,
    EditarProductoComponent,
    PedidosComponent,
    PedidoDetalleComponent,
    MigrarproductoComponent,
    ChatBoxComponent,
    NotaVentaComponent,//Nota DECLARAR pages para que funciona route-oulet
    CajaComponent, 
    VentasComponent, SliderComponent, EmpresaComponent, BannerComponent 
  ],
  exports: [
    IsInvalidPipe,
    HasErrorPipe,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    PAGES_ROUTES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    DataTablesModule,
    ColorPickerModule,
    NgSelectModule,
    TooltipModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot()  
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class PagesModule { }
