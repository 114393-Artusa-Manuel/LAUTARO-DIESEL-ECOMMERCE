import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { CartService } from '../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Use signals exposed by AuthService (Angular 17)
  isAuthenticated = this.auth.isAuthenticatedSignal;
  usuario = this.auth.usuarioSignal;
  private cart = inject(CartService);
  totalCount$ = this.cart.totalCount$;

  isAdmin(): boolean {
    const u = this.usuario();
    const roles = u?.rol || u?.roles || u?.role;
    if (!roles) return false;

    const normalize = (s: string) => s.toLowerCase();

    // If it's a string that may contain RolEntity(...) or nombre= value, try to extract
    if (typeof roles === 'string') {
      // try patterns like nombre=administrador or RolEntity(..., nombre=administrador)
      const m = roles.match(/nombre=([^\)\]]+)/i);
      if (m && m[1]) {
        const name = m[1].trim().toLowerCase();
        console.debug('Navbar: detected role name from string:', name);
        return name.includes('admin') || name.includes('administrador');
      }
      const s = roles.toLowerCase();
      console.debug('Navbar: role string:', s);
      return s.includes('administrador') || s.includes('admin');
    }

    if (Array.isArray(roles)) {
      for (const r of roles) {
        if (!r) continue;
        if (typeof r === 'string' && (normalize(r).includes('admin') || normalize(r).includes('administrador'))) return true;
        if (typeof r === 'object') {
          const name = (r.nombre || r.name || r.role || '').toString().toLowerCase();
          if (name.includes('admin') || name.includes('administrador')) return true;
        }
      }
      return false;
    }

    if (typeof roles === 'object') {
      const name = (roles.nombre || roles.name || String(roles)).toString().toLowerCase();
      console.debug('Navbar: role object name:', name);
      return name.includes('admin') || name.includes('administrador');
    }

    return false;
  }

  // Modal state for logout confirmation
  showLogoutConfirm = false;

  openLogoutConfirm() {
    this.showLogoutConfirm = true;
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  confirmLogout() {
    this.showLogoutConfirm = false;
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
