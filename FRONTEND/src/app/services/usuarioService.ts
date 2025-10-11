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
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data));
      })
    );
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUsuario(): any {
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
}
