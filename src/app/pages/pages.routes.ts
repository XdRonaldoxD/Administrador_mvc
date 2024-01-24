import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './pages.component';
import { IndexComponent } from './index/index.component';
import { NuevoProductoComponent } from './nuevo-producto/nuevo-producto.component';
import { ProductosComponent } from './productos/productos.component';
import { PerfilComponent } from './perfil/perfil.component';
import { AuthGuard } from '../guards/auth.guard';
import { MarcasComponent } from './marcas/marcas.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { AtributoComponent } from './atributos/atributo.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidoDetalleComponent } from './pedido-detalle/pedido-detalle.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { PedidoresolverService } from '../resolver/Pedidoresolver.service';
import { MigrarproductoComponent } from './migrarproducto/migrarproducto.component';
import { NotaVentaComponent } from './nota-venta/nota-venta.component';
import { CajaComponent } from './caja/caja.component';
import { VentasComponent } from './ventas/ventas.component';
import { SliderComponent } from './TiendaOnline/slider/slider.component';
import { EmpresaComponent } from './empresa/empresa.component';
import { DatosPersonalesComponent } from './datos-personales/datos-personales.component';
import { DatosPersonalesresolverService } from '../resolver/DatosPersonalesresolver.service';
import { BajaComprobantesComponent } from './baja-comprobantes/baja-comprobantes.component';
import { LibroVentasComponent } from './libro-ventas/libro-ventas.component';
import { LibroVentasService } from '../resolver/LibroVentasresolver.service';
import { UsuarioComponent } from './usuario/usuario.component';
import { TraerProductosService } from '../resolver/TraerProductosresolver.service';
import { BodegaComponent } from './bodega/bodega.component';
import { SucursalComponent } from './sucursal/sucursal.component';
import { SucursalresolverService } from '../resolver/Sucursalresolver.service';
import { TraerDatosProductoService } from '../resolver/TraerDatosProductosresolver.service';
import { PromocionComponent } from './TiendaOnline/promocion/promocion.component';
import { ReporteVentaProductoComponent } from './reporte-venta-producto/reporte-venta-producto.component';


const pagesRoutes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    children: [
      { path: 'inicio', component: IndexComponent },
      {
        path: 'Nuevo-Producto', component: NuevoProductoComponent,
        resolve: { datos: TraerDatosProductoService }
      },
      {
        path: 'Editar-Producto/:id_producto', component: EditarProductoComponent,
        resolve: { datos: TraerProductosService }
      },
      { path: 'Producto', component: ProductosComponent },
      { path: 'Perfil', component: PerfilComponent },
      { path: 'Marca', component: MarcasComponent },
      { path: 'Categoria', component: CategoriaComponent },
      { path: 'Atributo', component: AtributoComponent },
      { path: 'Pedidos', component: PedidosComponent },
      {
        path: 'Detalle-Pedido/:id_pedido', component: PedidoDetalleComponent,
        resolve: { pedidodetalle: PedidoresolverService }
      },
      {
        path: 'Datos-Personales/:id_usuario', component: DatosPersonalesComponent,
        resolve: { datopersonal: DatosPersonalesresolverService }
      },
      {
        path: 'Datos-Personales', component: DatosPersonalesComponent
      },
      { path: 'chatBox', component: ChatBoxComponent },
      { path: 'Importar-Inventario', component: MigrarproductoComponent },
      { path: 'Nota-Venta', component: NotaVentaComponent },
      { path: 'Caja', component: CajaComponent },
      { path: 'Ventas', component: VentasComponent },

      { path: 'Slider', component: SliderComponent },
      { path: 'Empresa', component: EmpresaComponent },
      { path: 'Baja-Comprobantes', component: BajaComprobantesComponent },
      { path: 'Usuario', component: UsuarioComponent },
      { path: 'Bodega', component: BodegaComponent },
      { path: 'Promociones', component: PromocionComponent },
      { path: 'Venta-Producto', component: ReporteVentaProductoComponent },
      {
        path: 'Sucursal', component: SucursalComponent,
        resolve: { datos: SucursalresolverService }
      },
      {
        path: 'Libro-Ventas', component: LibroVentasComponent,
        resolve: { datos: LibroVentasService }

      },
      { path: '', redirectTo: '/IniciarSession', pathMatch: 'full' },
    ]
  },
  // { path: "**", component: LoginComponent },
];

export const PAGES_ROUTES = RouterModule.forChild(pagesRoutes)
