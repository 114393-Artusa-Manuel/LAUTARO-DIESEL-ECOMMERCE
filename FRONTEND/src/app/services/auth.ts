import { Injectable, signal, computed } from '@angular/core';
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
  private apiUrl = 'http://localhost:8080/api/auth/login';

  // user signal (Angular 17+). Initialized from localStorage when available.
  private _usuario = signal<any | null>(typeof window !== 'undefined' && window.localStorage && localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario') as string) : null);

  // computed signals
  public isAuthenticatedSignal = computed(() => !!this._usuario());
  public usuarioSignal = computed(() => this._usuario());

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, request).pipe(
      tap((response) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('usuario', JSON.stringify(response.data));
        }
        // update signal
        this._usuario.set(response.data);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    this._usuario.set(null);
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    // Protect access for SSR: localStorage is only available in browser
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return !!localStorage.getItem('token');
  }

  getUsuario(): any {
    // prefer signal value when available
    return this._usuario();
  }
}
