import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UsuarioService } from '../services/usuarioService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  // 🔹 Datos del formulario
  loginData = {
    correo: '',
    password: '',
  };

  // 🔹 Estado de carga y mensajes
  loading = false;
  errorMessage: string | null = null;
  backendDown = false;

  constructor(private auth: AuthService, private router: Router, private api: UsuarioService) {
    this.checkBackend();
  }

  onLogin(): void {
    if (this.backendDown) return;
    this.loading = true;
    this.errorMessage = null;

  const req = { correo: this.loginData.correo, clave: this.loginData.password };
  this.auth.login(req).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.loading = false;
        this.router.navigate(['/profile']); // redirige al perfil
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.errorMessage = 'Correo o contraseña incorrectos.';
        this.loading = false;
      },
    });
  }

  checkBackend() {
    this.api.ping().subscribe((ok) => {
      this.backendDown = !ok;
      if (!ok) this.errorMessage = 'No se pudo conectar con el servidor. Verificá que el backend esté encendido en http://localhost:8080';
      else this.errorMessage = null;
    });
  }
}
