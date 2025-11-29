import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PagoService } from '../services/pago.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="container py-5 text-center">
    <h2 class="text-success fw-bold">🎉 Pago aprobado</h2>
    <p class="mt-3">¡Gracias por tu compra! Tu transacción fue procesada correctamente.</p>

    <div *ngIf="status" class="alert alert-success mt-4 text-start mx-auto" style="max-width: 450px;">
      <p><strong>Estado:</strong> {{ status.status }}</p>
      <p><strong>Detalle:</strong> {{ status.statusDetail }}</p>
      <p><strong>Monto:</strong> {{ status.amount | currency:'ARS' }}</p>
      <p><strong>Método de pago:</strong> {{ status.paymentMethod }}</p>
      <p><strong>N° de operación:</strong> {{ status.paymentId }}</p>
    </div>

    <a routerLink="/" class="btn btn-primary mt-4">Volver al inicio</a>
  </div>
  `
})
export class SuccessComponent implements OnInit {
  status: any = null;

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    const orderId = sessionStorage.getItem('orderId');
    sessionStorage.removeItem('orderId');
    localStorage.removeItem('carrito');

    if (orderId) {
      this.pagoService.getStatus(orderId).subscribe({
        next: (res) => {
          console.log("Estado recibido:", res);
          this.status = res;
        },
        error: (err) => console.error('❌ Error al obtener estado del pago', err)
      });
    }
  }
}
