import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  correo: string;
  password: string;
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
  //  URL base general del backend. Preferimos usar el `environment` para cambiar entre
  //  entornos (local / staging). Si no existe, hacemos fallback a localhost.
  private baseUrl = (environment && environment.backendBaseUrl) ? environment.backendBaseUrl : 'http://localhost:8080';

  private _usuario = signal<any | null>(
    typeof window !== 'undefined' &&
      window.localStorage &&
      localStorage.getItem('usuario')
      ? JSON.parse(localStorage.getItem('usuario') as string)
      : null
  );

  public isAuthenticatedSignal = computed(() => !!this._usuario());
  public usuarioSignal = computed(() => this._usuario());

  constructor(private http: HttpClient) {}

  //  Mantiene sincronización entre pestañas
  private setupListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (ev: StorageEvent) => {
      if (ev.key === 'usuario') {
        try {
          const v = ev.newValue ? JSON.parse(ev.newValue) : null;
          this._usuario.set(v);
        } catch (e) {
          this._usuario.set(null);
        }
      }
    });

    window.addEventListener('app:user-updated', (ev: any) => {
      try {
        const detail = ev?.detail ?? null;
        this._usuario.set(detail);
      } catch (e) {
        this._usuario.set(null);
      }
    });
  }

  private _listenersInitialized = (() => {
    try {
      typeof window !== 'undefined' && this.setupListeners();
      return true;
    } catch {
      return false;
    }
  })();

  //  LOGIN
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, request).pipe(
      tap((response) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('usuario', JSON.stringify(response.data));
        }
        this._usuario.set(response.data);
      })
    );
  }

  //  LOGOUT
  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    this._usuario.set(null);
  }

  //  Obtener token actual
  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem('token');
  }

  //  Saber si hay sesión activa
  isAuthenticated(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return !!localStorage.getItem('token');
  }

  getUsuario(): any {
    return this._usuario();
  }

  //  Recuperación de contraseña
  requestPasswordRecovery(correo: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/recover`, { correo });
  }

  //  Restablecer contraseña
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, { token, newPassword });
  }
}
