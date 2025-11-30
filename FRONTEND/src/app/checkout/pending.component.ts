import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container py-5 text-center">
    <h2 class="text-warning">🕒 Pago pendiente</h2>
    <p>Tu pago aún no fue procesado. Te notificaremos cuando se confirme.</p>
  </div>
  `
})
export class PendingComponent {}
