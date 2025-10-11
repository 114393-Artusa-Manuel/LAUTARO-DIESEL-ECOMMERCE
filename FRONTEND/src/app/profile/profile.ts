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

  usuario: any = null;
  roleName: string = '—';

  constructor() {
    this.usuario = this.auth.getUsuario();
    this.roleName = this.deriveRoleName(this.usuario);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
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

