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


const pagesRoutes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: 'inicio', component: IndexComponent, canActivate: [AuthGuard] },
      { path: 'Nuevo-Producto', component: NuevoProductoComponent, canActivate: [AuthGuard] },
      { path: 'Editar-Producto/:id_producto', component: EditarProductoComponent, canActivate: [AuthGuard] },
      { path: 'Producto', component: ProductosComponent, canActivate: [AuthGuard] },
      { path: 'Perfil', component: PerfilComponent, canActivate: [AuthGuard] },
      { path: 'Marca', component: MarcasComponent, canActivate: [AuthGuard] },
      { path: 'Categoria', component: CategoriaComponent, canActivate: [AuthGuard] },
      { path: 'Atributo', component: AtributoComponent, canActivate: [AuthGuard] },
      { path: 'Pedidos', component: PedidosComponent, canActivate: [AuthGuard] },
      {
        path: 'Detalle-Pedido/:id_pedido', component: PedidoDetalleComponent, canActivate: [AuthGuard],
        resolve: { pedidodetalle: PedidoresolverService }
      },
      { path: 'chatBox', component: ChatBoxComponent, canActivate: [AuthGuard] },
      { path: 'Importar-Inventario', component: MigrarproductoComponent, canActivate: [AuthGuard] },
      { path: 'Nota-Venta', component: NotaVentaComponent, canActivate: [AuthGuard] },
      { path: 'Caja', component: CajaComponent, canActivate: [AuthGuard] },
      { path: 'Ventas', component: VentasComponent, canActivate: [AuthGuard] },

      { path: 'Slider', component: SliderComponent, canActivate: [AuthGuard] },
      { path: 'Empresa', component: EmpresaComponent, canActivate: [AuthGuard] },


      { path: '', redirectTo: '/IniciarSession', pathMatch: 'full' },
    ]
    // ,
    // canActivate:[AuthGuard]
  },
  // { path: "**", component: LoginComponent },
];

export const PAGES_ROUTES = RouterModule.forChild(pagesRoutes)
