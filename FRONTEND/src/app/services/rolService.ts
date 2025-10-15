
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.get<Array<{ id: number; nombre: string }>>(
      `${this.base}/RoleAssigne/${userId}/roles`,
      { headers }
    );
  }

  // set idempotente: reemplaza por el conjunto exacto
  setUserRoles(userId: number | string, roleIds: number[], token?: string) {
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.put(
      `${this.base}/RoleAssigne/${userId}/roles`,
      { roleIds },
      { headers }
    );
  }

  // opcionales granulares
  addUserRoles(userId: number | string, roleIds: number[], token?: string) {
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.post(
      `${this.base}/RoleAssigne/${userId}/roles/add`,
      { roleIds },
      { headers }
    );
  }

  removeUserRoles(userId: number | string, roleIds: number[], token?: string) {
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.request(
      'DELETE',
      `${this.base}/RoleAssigne/${userId}/roles/remove`,
      { body: { roleIds }, headers }
    );
  }
}

