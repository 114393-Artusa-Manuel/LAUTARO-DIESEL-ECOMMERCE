import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

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

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    this.loading = true;
    this.errorMessage = null;

    this.auth.login(this.loginData).subscribe({
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
}
