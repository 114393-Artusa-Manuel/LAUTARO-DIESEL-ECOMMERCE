import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-recovery.html'
})
export class PasswordRecovery {
  correo = '';
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(private auth: AuthService) {}

  submit() {
    this.error = null;
    this.message = null;

    if (!this.correo) {
      this.error = 'Por favor ingresá tu correo electrónico.';
      return;
    }

    this.loading = true;
    this.auth.requestPasswordRecovery(this.correo).subscribe({
      next: (res) => {
        this.message = res?.message ?? 'Si el correo existe, se enviará un enlace de recuperación.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Ocurrió un error al solicitar la recuperación.';
        this.loading = false;
      }
    });
  }
}
