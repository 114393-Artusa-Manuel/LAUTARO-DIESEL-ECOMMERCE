// src/app/panel-admin/panel-admin.ts
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, AuthService } from '../services/usuarioService';
import { RolesService } from '../services/rolService';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Location } from '@angular/common';


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
  private location = inject(Location);

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
    this.filterSub = this.filter$.pipe(debounceTime(300)).subscribe(() => {
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
      if (Array.isArray(roles))
        return roles.some((r: any) =>
          (r?.nombre || r?.name || String(r)).toLowerCase().includes('admin')
        );
      if (typeof roles === 'object')
        return (roles?.nombre || roles?.name || String(roles)).toLowerCase().includes('admin');
      return false;
    })();
    if (!isAdmin) this.router.navigateByUrl('/');
    else this.loadUsuarios();

    // catálogo de roles
    this.rolesApi.getAll().subscribe({
      next: (res: any) => {
        this.availableRoles = Array.isArray(res) ? res : res?.data ?? res ?? [];
      },
      error: () => {
        this.availableRoles = [];
      },
    });

    // sync: reload when roles change elsewhere
    if (typeof window !== 'undefined') {
      window.addEventListener('app:roles-updated', () => this.loadUsuarios());
      window.addEventListener('storage', (ev: StorageEvent) => {
        if (ev.key === 'rolesUpdatedAt') this.loadUsuarios();
      });
    }
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
          this.usuarios = Array.isArray(res) ? res : res?.data ?? res ?? [];
          // normalize/resolve roles for display
          this.resolveUserRoles();
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
    const q = (this.search || '').trim();
    const rf = this.roleFilter;
    // parse dates and make inclusive range: from 00:00:00 to 23:59:59.999
    const fd = this.fromDate ? new Date(this.fromDate) : null;
    const td = this.toDate ? new Date(this.toDate) : null;
    if (fd) fd.setHours(0, 0, 0, 0);
    if (td) td.setHours(23, 59, 59, 999);

    const getDate = (u: any) => new Date(u.fechaCreacion ?? u.createdAt ?? u.created ?? 0);

    const normalize = (s: any) => {
      if (!s && s !== 0) return '';
      try {
        return String(s)
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/[\u0300-\u036f]/g, '');
      } catch (e) {
        return String(s).toLowerCase();
      }
    };

    const getRolesInfo = (u: any) => {
      const r = u.roles ?? u.rol ?? u.role ?? [];
      const arr = Array.isArray(r) ? r : [r];
      const names: string[] = [];
      const ids: number[] = [];
      for (const it of arr) {
        if (it == null) continue;
        if (typeof it === 'string' || typeof it === 'number') {
          const s = String(it);
          names.push(normalize(s));
          // extract numeric tokens from string (handles cases like 'RolEntity(...id=3)')
          const n = Number(it);
          if (!isNaN(n)) ids.push(n);
          const found = s.match(/\b(\d+)\b/g);
          if (found)
            for (const f of found) {
              const vf = Number(f);
              if (!isNaN(vf)) ids.push(vf);
            }
        } else if (typeof it === 'object') {
          const name = it.nombre ?? it.name ?? it.role ?? JSON.stringify(it);
          names.push(normalize(name));
          const id = Number(it.id ?? it.roleId ?? it.idRol ?? NaN);
          if (!isNaN(id)) ids.push(id);
          // also scan object values for numeric ids
          try {
            const json = JSON.stringify(it);
            const found = json.match(/\b(\d+)\b/g);
            if (found)
              for (const f of found) {
                const vf = Number(f);
                if (!isNaN(vf)) ids.push(vf);
              }
          } catch {}
        }
      }
      return { names, ids };
    };

    const textMatch = (u: any) => {
      if (!q) return true;
      const name = normalize(u.nombre ?? u.nombreCompleto ?? u.name ?? '');
      const mail = normalize(u.email ?? u.correo ?? '');
      const qn = normalize(q);
      return name.includes(qn) || mail.includes(qn);
    };

    const hasRole = (u: any) => {
      if (rf == null || rf === '') return true;
      const { names, ids } = getRolesInfo(u);

      // if rf is numeric (or a numeric string) prefer id match
      const maybeNum = String(rf).trim();
      if (maybeNum !== '' && !isNaN(Number(maybeNum))) {
        const n = Number(maybeNum);
        if (!isNaN(n)) return ids.includes(n) || names.some((nm) => nm.includes(String(n)));
      }

      // otherwise treat rf as part of role name (case- and diacritics-insensitive)
      const needle = normalize(String(rf));

      // match against resolved role names first
      if (Array.isArray(u._roleNames) && u._roleNames.length) {
        return u._roleNames.map((x: any) => normalize(x)).some((rn: string) => rn.includes(needle));
      }

      // fallback to names/ids extracted from the user object
      if (names.some((nm) => nm.includes(needle))) return true;
      // also match against availableRoles catalog names (in case user has only ids)
      const catalogNameMatch = this.availableRoles.some(
        (r) => normalize(r.nombre).includes(needle) && ids.includes(r.id)
      );
      if (catalogNameMatch) return true;

      return ids.some((id) => String(id).includes(needle));
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

    this.usuariosView = sorted.filter((u) => textMatch(u) && hasRole(u) && inRange(u));
  }

  // eventos filtros
  onFilterChange() {
    this.applyClientFilters();
    this.filter$.next();
  }

  // After loading users, attempt to resolve role names for each user using the availableRoles catalog
  private resolveUserRoles() {
    const catalog = new Map<number, string>();
    for (const r of this.availableRoles) catalog.set(r.id, r.nombre);

    for (const u of this.usuarios) {
      const r = u.roles ?? u.rol ?? u.role ?? [];
      const arr = Array.isArray(r) ? r : [r];
      const names: string[] = [];
      for (const it of arr) {
        if (it == null) continue;
        if (typeof it === 'number' || typeof it === 'string') {
          const id = Number(it);
          if (!isNaN(id) && catalog.has(id)) names.push(catalog.get(id) as string);
          else names.push(String(it));
        } else if (typeof it === 'object') {
          if (it.nombre) names.push(it.nombre);
          else if (it.name) names.push(it.name);
          else if (it.id && catalog.has(Number(it.id)))
            names.push(catalog.get(Number(it.id)) as string);
          else names.push(JSON.stringify(it));
        }
      }
      u._roleNames = Array.from(new Set(names));
    }
  }

  // Get display string for user's roles
  getRoleNames(u: any) {
    if (!u) return '';
    if (Array.isArray(u._roleNames) && u._roleNames.length) return u._roleNames.join(', ');
    const r = u.roles ?? u.rol ?? u.role ?? [];
    if (Array.isArray(r)) return r.map((x: any) => x?.nombre ?? x?.name ?? String(x)).join(', ');
    return String(r);
  }

  // modal roles
  openAssign(user: any) {
    this.assigningTo = user;
    this.selectedRoleIds.clear();
    // decode current token for debugging
    try {
      const t = this.auth.getToken();
      if (t) {
        const payload = t.split('.').slice(1, 2)[0];
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        this.decodedToken = json;
      } else this.decodedToken = null;
    } catch (e) {
      this.decodedToken = null;
    }

    const uid = user.id || user.idUsuario || user.userId;
    const token = this.auth.getToken();

    this.assignLoading = true;
    this.rolesApi.getUserRoles(uid, token ?? undefined).subscribe({
      next: (roles) => {
        for (const r of roles ?? []) this.selectedRoleIds.add(r.id);
        this.assignLoading = false;
      },
      error: () => {
        // fallback: intenta parsear del listado
        const fallback = user.roles ?? user.rol ?? user.role ?? [];
        const ids = Array.isArray(fallback)
          ? fallback.map((r: any) => +((r?.id ?? r) as number)).filter((n: number) => !isNaN(n))
          : [];
        for (const id of ids) this.selectedRoleIds.add(id);
        this.assignLoading = false;
      },
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
    try {
      console.log('[PanelAdmin] saveRoles', { uid, roleIds, hasToken: !!token });
    } catch {}
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
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  // track opcional si lo querés en *ngFor clásico
  trackByUser = (_: number, u: any) => u?.id ?? u?.idUsuario ?? u?.userId ?? _;
}
