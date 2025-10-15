import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';

export interface RegistroReq {
  correo: string;
  clave: string;
  nombreCompleto: string;
  telefono: string;
  rolesIds: number[];
}

export interface LoginReq {
  correo: string;
  clave: string;
}

interface LoginResponse {
  mensaje: string;
  codigo: number;
  data: {
    token: string;
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';

  constructor(private http: HttpClient) {}

  login(request: LoginReq): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, request).pipe(
      tap((response) => {
        // Guardar token y datos del usuario
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('usuario', JSON.stringify(response.data));
        }
      })
    );
  }
  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return !!localStorage.getItem('token');
  }

  getUsuario(): any {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  registrarUsuario(data: RegistroReq): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  /**
   * Lightweight ping to check whether the backend is reachable.
   * Returns an observable that emits true when reachable, false otherwise.
   */
  ping(): Observable<boolean> {
    return this.http.get(this.apiUrl, { observe: 'response' as const }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  iniciarSesion(data: LoginReq): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  /**
   * List users with optional filters: search, role, from/to dates, sort
   */
  listUsuarios(params?: {
    search?: string;
    role?: string | number;
    from?: string; // ISO date
    to?: string; // ISO date
    sort?: 'recent' | 'oldest';
    page?: number;
    size?: number;
  }) {
    const q: Record<string, any> = {};
    if (params) {
      if (params.search) q['search'] = params.search;
      if (params.role) q['role'] = params.role;
      if (params.from) q['from'] = params.from;
      if (params.to) q['to'] = params.to;
      if (params.sort) q['sort'] = params.sort;
      if (params.page != null) q['page'] = params.page;
      if (params.size != null) q['size'] = params.size;
    }
    return this.http.get(`${this.apiUrl}`, { params: q as any });
  }

  /**
   * Retrieve available roles from the backend (/api/roles)
   */
  getRoles() {
    // returns Observable<RolEntity[]> but keep untyped to avoid pulling entity type
    return this.http.get(`${this.apiUrl.replace('/api/usuarios','') || ''}/api/roles`.replace('//api','/api'));
  }

  /**
   * Assign a role to a user using the backend RoleAssigneController endpoint.
   * Requires Authorization: Bearer <token>
   */
  assignRole(idUsuario: number | string, roleId: number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return this.http.patch(`${this.apiUrl.replace('/api/usuarios','') || ''}/RoleAssigne/${idUsuario}/roles/add`, { roleId }, { headers });
  }
}
