// src/app/panel-admin/panel-admin.ts
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, AuthService } from '../services/usuarioService';
import { RolesService } from '../services/rolService';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-admin.html',
  styleUrls: ['./panel-admin.css'],
})
export class PanelAdmin implements OnDestroy {
  private api = inject(UsuarioService);
  private rolesApi = inject(RolesService);
  private auth = inject(AuthService);
  private router = inject(Router);

  usuarios: any[] = [];
  usuariosView: any[] = [];

  loading = false;
  error = '';

  // filtros
  search = '';
  roleFilter: string | number | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  sort: 'recent' | 'oldest' = 'recent';
  page = 0;
  size = 20;

  // reactive filtering
  private filter$ = new Subject<void>();
  private filterSub: Subscription | null = null;

  // roles
  assigningTo: any = null;
  availableRoles: Array<{ id: number; nombre: string }> = [];
  assignLoading = false;
  selectedRoleIds = new Set<number>();
  // dev helper: decoded token claims for debugging
  decodedToken: any = null;

  constructor() {
    // filtros con debounce
    this.filterSub = this.filter$
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.page = 0;
        this.applyClientFilters();
        this.loadUsuarios();
      });

    // guardia admin
    const user = this.auth.getUsuario();
    const roles = user?.rol || user?.roles || null;
    const isAdmin = (() => {
      if (!roles) return false;
      if (typeof roles === 'string') return roles.toLowerCase().includes('admin');
      if (Array.isArray(roles)) return roles.some((r: any) => (r?.nombre || r?.name || String(r)).toLowerCase().includes('admin'));
      if (typeof roles === 'object') return (roles?.nombre || roles?.name || String(roles)).toLowerCase().includes('admin');
      return false;
    })();
    if (!isAdmin) this.router.navigateByUrl('/');
    else this.loadUsuarios();

    // catálogo de roles
    this.rolesApi.getAll().subscribe({
      next: (res: any) => { this.availableRoles = Array.isArray(res) ? res : (res?.data ?? res ?? []); },
      error: () => { this.availableRoles = []; },
    });
  }

  ngOnDestroy(): void {
    this.filterSub?.unsubscribe();
  }

  // carga usuarios
  loadUsuarios() {
    this.loading = true;
    this.error = '';
    this.api
      .listUsuarios({
        search: this.search || undefined,
        role: this.roleFilter || undefined,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
        sort: this.sort,
        page: this.page,
        size: this.size,
      })
      .subscribe({
        next: (res: any) => {
          this.usuarios = Array.isArray(res) ? res : (res?.data ?? res ?? []);
          this.applyClientFilters();
          this.loading = false;
        },
        error: () => {
          this.error = 'Error al cargar usuarios';
          this.loading = false;
        },
      });
  }

  // filtro cliente
  private applyClientFilters() {
    const q = (this.search || '').trim().toLowerCase();
    const rf = this.roleFilter;
    const fd = this.fromDate ? new Date(this.fromDate) : null;
    const td = this.toDate ? new Date(this.toDate) : null;

    const getDate = (u: any) =>
      new Date(u.fechaCreacion ?? u.createdAt ?? u.created ?? 0);

    const hasRole = (u: any) => {
      if (rf == null || rf === '') return true;
      const r = u.roles ?? u.rol ?? u.role;
      const txt = JSON.stringify(r ?? '').toLowerCase();
      return txt.includes(String(rf).toLowerCase());
    };

    const textMatch = (u: any) => {
      if (!q) return true;
      const name = (u.nombre ?? u.nombreCompleto ?? u.name ?? '').toLowerCase();
      const mail = (u.email ?? u.correo ?? '').toLowerCase();
      return name.includes(q) || mail.includes(q);
    };

    const inRange = (u: any) => {
      const d = getDate(u);
      if (isNaN(+d)) return true;
      if (fd && d < fd) return false;
      if (td && d > td) return false;
      return true;
    };

    const sorted = [...this.usuarios].sort((a, b) => {
      const da = +getDate(a);
      const db = +getDate(b);
      return this.sort === 'recent' ? db - da : da - db;
    });

    this.usuariosView = sorted.filter(u => textMatch(u) && hasRole(u) && inRange(u));
  }

  // eventos filtros
  onFilterChange() {
    this.applyClientFilters();
    this.filter$.next();
  }

  // modal roles
  openAssign(user: any) {
    this.assigningTo = user;
    this.selectedRoleIds.clear();
    // decode current token for debugging
    try {
      const t = this.auth.getToken();
      if (t) {
        const payload = t.split('.').slice(1,2)[0];
        const json = JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
        this.decodedToken = json;
      } else this.decodedToken = null;
    } catch (e) { this.decodedToken = null; }

    const uid = user.id || user.idUsuario || user.userId;
    const token = this.auth.getToken();

    this.assignLoading = true;
    this.rolesApi.getUserRoles(uid, token ?? undefined).subscribe({
      next: roles => {
        for (const r of roles ?? []) this.selectedRoleIds.add(r.id);
        this.assignLoading = false;
      },
      error: () => {
        // fallback: intenta parsear del listado
        const fallback = (user.roles ?? user.rol ?? user.role) ?? [];
        const ids = Array.isArray(fallback)
          ? fallback.map((r:any) => +((r?.id ?? r) as number)).filter((n:number) => !isNaN(n))
          : [];
        for (const id of ids) this.selectedRoleIds.add(id);
        this.assignLoading = false;
      }
    });
  }

  cancelAssign() {
    this.assigningTo = null;
    this.selectedRoleIds.clear();
  }

  toggleRole(id: number, checked: boolean) {
    if (checked) this.selectedRoleIds.add(id);
    else this.selectedRoleIds.delete(id);
  }
  selectAll() {
    for (const r of this.availableRoles) this.selectedRoleIds.add(r.id);
  }
  selectNone() {
    this.selectedRoleIds.clear();
  }

  saveRoles() {
    if (!this.assigningTo) return;
    const uid = this.assigningTo.id || this.assigningTo.idUsuario || this.assigningTo.userId;
    const token = this.auth.getToken();
    const roleIds = Array.from(this.selectedRoleIds.values());

    this.assignLoading = true;
  try { console.log('[PanelAdmin] saveRoles', { uid, roleIds, hasToken: !!token }); } catch {}
  this.assignLoading = true;
  this.rolesApi.setUserRoles(uid, roleIds, token ?? undefined).subscribe({
      next: () => {
        this.assignLoading = false;
        this.cancelAssign();
        this.loadUsuarios();
      },
      error: (err: any) => {
        this.assignLoading = false;
        try {
          // Prefer backend message when available
          const msg = err?.error ?? err?.message ?? JSON.stringify(err);
          this.error = typeof msg === 'string' ? msg : JSON.stringify(msg);
        } catch (e) {
          this.error = 'Error al guardar roles';
        }
      }
    });
  }

  // track opcional si lo querés en *ngFor clásico
  trackByUser = (_: number, u: any) => u?.id ?? u?.idUsuario ?? u?.userId ?? _;
}
