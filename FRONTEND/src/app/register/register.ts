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

  f = this.fb.nonNullable.group<RegistroForm>({
    correo: '',
    clave: '',
    nombreCompleto: '',
    telefono: '',
    rolesIds: [1],
  }, {
    validators: [
      Validators.required,
    ]
  });

  submit() {
  if (this.f.invalid) return;
  const v = this.f.getRawValue();
  const payload = {
    ...v,
    rolesIds: Array.isArray(v.rolesIds) ? v.rolesIds : [v.rolesIds], // <-- fuerza array
  };
  this.api.registrarUsuario(payload).subscribe({
    next: () => {
      this.mensaje = 'Usuario registrado correctamente';
      this.router.navigateByUrl('/login');
    },
    error: (err) => {
      this.error = err?.error?.message || err?.message || 'Error al registrar';
    }
  });
}
}