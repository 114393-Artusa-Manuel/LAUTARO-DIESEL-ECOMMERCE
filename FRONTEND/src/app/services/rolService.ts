
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private base = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // catálogo de roles
  getAll() {
    return this.http.get<Array<{ id: number; nombre: string }>>(`${this.base}/api/roles`);
  }

  // roles actuales de un usuario
  getUserRoles(userId: number | string, token?: string) {
    // if caller didn't provide a token, try reading it from localStorage (browser)
    let t = token;
    if (!t && typeof window !== 'undefined' && window.localStorage) {
      t = localStorage.getItem('token') ?? undefined;
    }
    const headers: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
    return this.http.get<Array<{ id: number; nombre: string }>>(`${this.base}/RoleAssigne/${userId}/roles`, { headers });
  }

  // set idempotente: reemplaza por el conjunto exacto
  setUserRoles(userId: number | string, roleIds: number[], token?: string) {
    let t = token;
    if (!t && typeof window !== 'undefined' && window.localStorage) {
      t = localStorage.getItem('token') ?? undefined;
    }
    const headers: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
    // Dev debug info
    try { console.log('[RolesService] setUserRoles', { url: `${this.base}/RoleAssigne/${userId}/roles`, roleIds, token: !!t }); } catch {}
    return this.http.put(`${this.base}/RoleAssigne/${userId}/roles`, { roleIds }, { headers }).pipe(
      tap(() => {
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:roles-updated', { detail: { userId, roleIds } }));
            localStorage.setItem('rolesUpdatedAt', Date.now().toString());
          }
        } catch (e) {}
      })
    );
  }

  // opcionales granulares
  addUserRoles(userId: number | string, roleIds: number[], token?: string) {
    let t = token;
    if (!t && typeof window !== 'undefined' && window.localStorage) {
      t = localStorage.getItem('token') ?? undefined;
    }
    const headers: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
    try { console.log('[RolesService] addUserRoles', { url: `${this.base}/RoleAssigne/${userId}/roles/add`, roleIds, token: !!t }); } catch {}
    return this.http.post(`${this.base}/RoleAssigne/${userId}/roles/add`, { roleIds }, { headers }).pipe(
      tap(() => {
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:roles-updated', { detail: { userId, roleIds } }));
            localStorage.setItem('rolesUpdatedAt', Date.now().toString());
          }
        } catch (e) {}
      })
    );
  }

  removeUserRoles(userId: number | string, roleIds: number[], token?: string) {
    let t = token;
    if (!t && typeof window !== 'undefined' && window.localStorage) {
      t = localStorage.getItem('token') ?? undefined;
    }
    const headers: Record<string, string> = t ? { Authorization: `Bearer ${t}` } : {};
    try { console.log('[RolesService] removeUserRoles', { url: `${this.base}/RoleAssigne/${userId}/roles/remove`, roleIds, token: !!t }); } catch {}
    return this.http.request('DELETE', `${this.base}/RoleAssigne/${userId}/roles/remove`, { body: { roleIds }, headers }).pipe(
      tap(() => {
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('app:roles-updated', { detail: { userId, roleIds } }));
            localStorage.setItem('rolesUpdatedAt', Date.now().toString());
          }
        } catch (e) {}
      })
    );
  }
}

