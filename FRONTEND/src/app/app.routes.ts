import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';
import { Register } from './register/register';
import { Profile } from './profile/profile';
import { AuthGuard } from './services/auth.guard';
import { PanelAdmin } from './panel-admin/panel-admin';
import { ProductosAdmin } from './productos-admin/productos-admin';
import { PaymentsAdmin } from './payments-admin/payments-admin';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { PasswordRecovery } from './password-recovery/password-recovery';
import { Productos } from './productos/productos';
import { ProductoDetalle } from './producto-detalle/producto-detalle';
import { Carrito } from './carrito/carrito';
import { CheckoutComponent } from './checkout/checkout.component';
import { SuccessComponent } from './checkout/success.component';
import { FailureComponent } from './checkout/failure.component';
import { PendingComponent } from './checkout/pending.component';
import { FaqComponent } from './pages/faq/faq.component';
import { TerminosCondicionesComponent } from './pages/terminos-condiciones/terminos-condiciones.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'password-recovery', component: PasswordRecovery },
  { path: 'register', component: Register },
  { path: 'productos', component: Productos },
  { path: 'productos/:id', component: ProductoDetalle },
  { path: 'carrito', component: Carrito },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'panel-admin', component: PanelAdmin, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboard, canActivate: [AuthGuard] },
  { path: 'admin/productos', component: ProductosAdmin, canActivate: [AuthGuard] },
  { path: 'admin/pagos', component: PaymentsAdmin, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/success', component: SuccessComponent },
  { path: 'checkout/failure', component: FailureComponent },
  { path: 'checkout/pending', component: PendingComponent },
  { path: 'terminos', component: TerminosCondicionesComponent },
  { path: 'faq', component: FaqComponent },
  { path: '**', redirectTo: 'home' },
];
