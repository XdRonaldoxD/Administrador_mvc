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
import { PermisosComponent } from './permisos/permisos.component';
import { PermisoGuard } from '../guards/permiso.guard';


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
        resolve: { datos: TraerDatosProductoService },
        canActivate: [PermisoGuard], data: { modulo: 'PRODUCTOS' }
      },
      {
        path: 'Editar-Producto/:id_producto', component: EditarProductoComponent,
        resolve: { datos: TraerProductosService },
        canActivate: [PermisoGuard], data: { modulo: 'PRODUCTOS' }
      },
      { path: 'Producto', component: ProductosComponent, canActivate: [PermisoGuard], data: { modulo: 'PRODUCTOS' } },
      { path: 'Perfil', component: PerfilComponent },
      { path: 'Marca', component: MarcasComponent, canActivate: [PermisoGuard], data: { modulo: 'MARCAS' } },
      { path: 'Categoria', component: CategoriaComponent, canActivate: [PermisoGuard], data: { modulo: 'CATEGORIAS' } },
      { path: 'Atributo', component: AtributoComponent, canActivate: [PermisoGuard], data: { modulo: 'ATRIBUTOS' } },
      { path: 'Pedidos', component: PedidosComponent, canActivate: [PermisoGuard], data: { modulo: 'PEDIDOS' } },
      {
        path: 'Detalle-Pedido/:id_pedido', component: PedidoDetalleComponent,
        resolve: { pedidodetalle: PedidoresolverService },
        canActivate: [PermisoGuard], data: { modulo: 'PEDIDOS' }
      },
      {
        path: 'Datos-Personales/:id_usuario', component: DatosPersonalesComponent,
        resolve: { datopersonal: DatosPersonalesresolverService }
      },
      {
        path: 'Datos-Personales', component: DatosPersonalesComponent
      },
      { path: 'chatBox', component: ChatBoxComponent, canActivate: [PermisoGuard], data: { modulo: 'CHAT CLIENTE' } },
      { path: 'Importar-Inventario', component: MigrarproductoComponent, canActivate: [PermisoGuard], data: { modulo: 'REPORTE PRODUCTOS' } },
      { path: 'Nota-Venta', component: NotaVentaComponent, canActivate: [PermisoGuard], data: { modulo: 'PAGO NOTA VENTA' } },
      { path: 'Caja', component: CajaComponent, canActivate: [PermisoGuard], data: { modulo: 'CAJA' } },
      { path: 'Ventas', component: VentasComponent, canActivate: [PermisoGuard], data: { modulo: 'VENTAS' } },

      { path: 'Slider', component: SliderComponent, canActivate: [PermisoGuard], data: { modulo: 'SLIDER' } },
      { path: 'Empresa', component: EmpresaComponent, canActivate: [PermisoGuard], data: { soloAdmin: true } },
      { path: 'Baja-Comprobantes', component: BajaComprobantesComponent, canActivate: [PermisoGuard], data: { modulo: 'ANULAR DOCUMENTOS' } },
      { path: 'Usuario', component: UsuarioComponent, canActivate: [PermisoGuard], data: { soloAdmin: true } },
      { path: 'Permisos', component: PermisosComponent, canActivate: [PermisoGuard], data: { soloAdmin: true } },
      { path: 'Bodega', component: BodegaComponent, canActivate: [PermisoGuard], data: { modulo: 'BODEGAS' } },
      { path: 'Promociones', component: PromocionComponent, canActivate: [PermisoGuard], data: { modulo: 'PROMOCIONES' } },
      { path: 'Venta-Producto', component: ReporteVentaProductoComponent, canActivate: [PermisoGuard], data: { modulo: 'REPORTE VENTA PRODUCTO' } },
      {
        path: 'Sucursal', component: SucursalComponent,
        resolve: { datos: SucursalresolverService },
        canActivate: [PermisoGuard], data: { modulo: 'SUCURSAL' }
      },
      {
        path: 'Libro-Ventas', component: LibroVentasComponent,
        resolve: { datos: LibroVentasService },
        canActivate: [PermisoGuard], data: { modulo: 'LIBRO VENTAS' }
      },
      { path: '', redirectTo: '/IniciarSession', pathMatch: 'full' },
    ]
  },
  // { path: "**", component: LoginComponent },
];

export const PAGES_ROUTES = RouterModule.forChild(pagesRoutes)
