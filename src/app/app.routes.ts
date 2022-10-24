
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

const appRoutes: Routes = [

  { path: "IniciarSession", component: LoginComponent },
  { path: "RegistrarSession", component: RegisterComponent },
  { path: "**", component: LoginComponent },
];
export const APP_ROUTES = RouterModule.forRoot(appRoutes, { useHash: true });
