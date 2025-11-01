import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/usuarioService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(AuthService as any); // using AuthService module which re-exports UsuarioService in this project

  usuario: any = null;
  roleName: string = '—';

  constructor() {
    this.usuario = this.auth.getUsuario();
    this.roleName = this.deriveRoleName(this.usuario);
    // check backend reachability briefly
    // (if you have a dedicated ping endpoint we should use that instead)
    // Note: injected api above is a workaround; if project structure differs update accordingly.
    try {
      (this.api as any).ping?.().subscribe?.((ok: boolean) => {
        if (!ok) {
          // backend might be down — show a warning in the UI (handled in template)
          this.usuario = null;
        }
      });
    } catch (e) {}
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  // modal state for logout confirmation in profile
  showLogoutConfirm = false;

  openLogoutConfirm() {
    this.showLogoutConfirm = true;
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  confirmLogout() {
    this.showLogoutConfirm = false;
    this.logout();
  }

  private deriveRoleName(usuario: any): string {
    if (!usuario) return '—';

    // Common fields: rol, role, roles, rolesIds
    const candidates = [usuario.rol, usuario.role, usuario.roles, usuario.rolesIds];

    for (const c of candidates) {
      if (!c) continue;
      // string
      if (typeof c === 'string') {
        // If backend returned a stringified entity like "[RolEntity(id=1, nombre=administrador)]",
        // try to extract the nombre= value.
        const m = c.match(/nombre=([^\)\]]+)/);
        if (m) return m[1].trim();
        return c;
      }

      // array
      if (Array.isArray(c) && c.length > 0) {
        const first = c[0];
        if (!first) continue;
        if (typeof first === 'string') return first;
        if (typeof first === 'object') return (first.nombre || first.name || String(first)).toString();
      }

      // object
      if (typeof c === 'object') {
        return (c.nombre || c.name || String(c)).toString();
      }
    }

    return '—';
  }
}

