import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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

  constructor() {
    // Clear server-side 'taken' error when user edits the correo field
    try {
      const correoControl = this.f.controls.correo;
      correoControl.valueChanges.subscribe(() => {
        if (correoControl.errors && correoControl.errors['taken']) {
          const newErrs = { ...correoControl.errors };
          delete newErrs['taken'];
          correoControl.setErrors(Object.keys(newErrs).length ? newErrs : null);
        }
      });
    } catch (e) {
      // ignore if controls aren't initialized in some environments
    }
  }

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
      next: (res: any) => {
        // Some backends wrap responses in an object with a 'codigo' and 'mensaje' and
        // may still return HTTP 200. Handle that: if codigo !== 201 treat as error.
        if (res && typeof res === 'object' && 'codigo' in res) {
          const code = Number(res.codigo);
          const msg = res.mensaje || res.message || '';
          if (code !== 201) {
            // Map known backend message to correo 'taken' if it says the email exists
            const isEmailTaken = code === 400 && /correo|email|ya existe|ya está registrado/i.test(msg);
            if (isEmailTaken) {
              try {
                const correoControl = this.f.controls.correo;
                const errs = { ...(correoControl.errors || {}), taken: true };
                correoControl.setErrors(errs);
              } catch (e) {}
            }
            this.loading = false;
            this.error = msg || 'Error al registrar';
            return;
          }
          // else proceed as success
        }

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

  // Prefer Spanish 'mensaje' field used by backend, fall back to other common fields
  const serverMsg = err?.error?.message || err?.error?.mensaje || err?.message || '';
  // Consider email taken when server returns 409, or when message/body indicates the email already exists
  const isEmailTaken = err?.status === 409 || /correo|email|ya existe|ya está registrado|already.*exist|already.*registered/i.test(serverMsg);
        if (isEmailTaken) {
          try {
            const correoControl = this.f.controls.correo;
            const errs = { ...(correoControl.errors || {}), taken: true };
            correoControl.setErrors(errs);
          } catch (e) {
            // ignore
          }
          this.error = 'El correo ya está registrado.';
          return;
        }

        this.error = serverMsg || 'Error al registrar';
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