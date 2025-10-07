import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  registrarUsuario(data: RegistroReq): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  iniciarSesion(data: LoginReq): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
}
