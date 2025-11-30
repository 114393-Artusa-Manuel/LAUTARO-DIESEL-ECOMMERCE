import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-failure',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container py-5 text-center">
    <h2 class="text-danger">❌ Pago rechazado</h2>
    <p>Hubo un problema al procesar tu pago. Intentá nuevamente.</p>
  </div>
  `
})
export class FailureComponent {}
