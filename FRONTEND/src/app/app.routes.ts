import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Profile } from './profile/profile';
import { AuthGuard } from './services/auth.guard';
import { PanelAdmin } from './panel-admin/panel-admin';
import { ProductosAdmin } from './productos-admin/productos-admin';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'panel-admin', component: PanelAdmin, canActivate: [AuthGuard] },
  { path: 'admin/productos', component: ProductosAdmin, canActivate: [AuthGuard] },
];