import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuarioService';

type RegistroForm = {
  correo: string;
  clave: string;
  nombreCompleto: string;
  telefono: string;
  rolesIds: number[];
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private fb = inject(FormBuilder);
  private api = inject(UsuarioService);
  private router = inject(Router);

  mensaje = '';
  error = '';
  loading = false;
  backendDown = false;
  showSuccess = false;

  f = this.fb.group({
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    clave: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(128)]],
    nombreCompleto: ['', [Validators.required, Validators.maxLength(120)]],
    telefono: ['', [Validators.maxLength(20)]],
    rolesIds: [[1]],
  }) as any; // cast to bypass strict typed form controls in this simple component

  submit() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.backendDown = false;

    const v = this.f.getRawValue();
    const payload = {
      ...v,
      rolesIds: Array.isArray(v.rolesIds) ? v.rolesIds : [v.rolesIds],
    };

    this.api.registrarUsuario(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess = true;
        // auto-redirect after a short delay
        setTimeout(() => this.closeSuccess(true), 2200);
      },
      error: (err) => {
        this.loading = false;
        // Network / CORS / server down often surface as status 0 or undefined
        if (err?.status === 0 || err?.status === undefined) {
          this.backendDown = true;
          this.error = 'No se pudo conectar con el servidor. Verificá que el backend esté encendido en http://localhost:8080';
          return;
        }
        this.error = err?.error?.message || err?.message || 'Error al registrar';
      },
    });
  }

  closeSuccess(redirect = false) {
    this.showSuccess = false;
    if (redirect) {
      this.router.navigateByUrl('/login');
    }
  }
}