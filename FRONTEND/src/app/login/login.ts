import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UsuarioService } from '../services/usuarioService';
import { Subscription, of, catchError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit, OnDestroy {
  //Datos del formulario
  loginData = {
    correo: '',
    password: '',
  };

  //Estado del componente
  loading = false;
  errorMessage: string | null = null;
  backendDown = false;

  //Control de suscripciones activas
  private subscriptions: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private api: UsuarioService
  ) {}

  ngOnInit(): void {
    //Solo verificamos el backend al iniciar el componente
    this.checkBackend();
  }

  //Manejo de login con control de errores
  onLogin(): void {
    if (this.backendDown) return;
    this.loading = true;
    this.errorMessage = null;

    const req = {
      correo: this.loginData.correo,
      password: this.loginData.password,
    };

    const sub = this.auth
      .login(req)
      .pipe(
        catchError((error) => {
          console.error('Error al iniciar sesión:', error);
          this.handleHttpError(error);
          return of(null); //evita que rompa el flujo
        })
      )
      .subscribe((response) => {
        if (!response) return;
        console.log('Login exitoso:', response);
        this.loading = false;
        this.router.navigate(['/profile']);
      });

    this.subscriptions.push(sub);
  }

  //Verificación segura del backend
  checkBackend(): void {
    const sub = this.api
      .ping()
      .pipe(
        catchError((error) => {
          console.warn('Backend no responde:', error);
          this.backendDown = true;
          this.errorMessage =
            '⚠️ No se pudo conectar con el servidor. Verificá que el backend esté encendido en http://localhost:8080';
          return of(false); // mantiene el componente vivo
        })
      )
      .subscribe((ok: any) => {
        this.backendDown = !ok;
        if (!ok) {
          this.errorMessage =
            '⚠️ No se pudo conectar con el servidor. Verificá que el backend esté encendido en http://localhost:8080';
        } else {
          this.errorMessage = null;
        }
      });

    this.subscriptions.push(sub);
  }

  //Manejo centralizado de errores HTTP
  private handleHttpError(error: any): void {
    this.loading = false;
    if (error.status === 0) {
      this.errorMessage =
        ' No se pudo conectar con el servidor. Revisá tu conexión.';
    } else if (error.status === 401) {
      this.errorMessage = 'Contraseña incorrecta.';
    } else if (error.status === 404) {
      this.errorMessage = 'El Usuario no existe.';
    } else if (error.status === 500) {
      this.errorMessage = 'Error interno del servidor.';
    } else {
      this.errorMessage =
        'Error desconocido. Intentá nuevamente más tarde.';
    }
  }

  //Limpieza segura al salir del login
  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
