import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword {
  token = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {
    this.error = null;
    this.message = null;

    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        this.message = res?.message ?? 'Contraseña actualizada correctamente.';
        this.loading = false;

        // Redirigir al login luego de 2 segundos
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Token inválido o expirado.';
        this.loading = false;
      }
    });
  }
}
