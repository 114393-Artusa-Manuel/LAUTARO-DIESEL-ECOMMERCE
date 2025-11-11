import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagoService } from '../services/pago.service';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container py-5 text-center">
    <h2 class="text-success">✅ Pago aprobado</h2>
    <p class="mt-3">Tu transacción fue procesada correctamente.</p>
    <div *ngIf="status" class="alert alert-success mt-4">
      <strong>Estado:</strong> {{ status.status }}<br>
      <strong>Detalle:</strong> {{ status.statusDetail }}
    </div>
  </div>
  `
})
export class SuccessComponent implements OnInit {
  status: any;

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    const orderId = sessionStorage.getItem('orderId');
    if (orderId) {
      this.pagoService.getStatus(orderId).subscribe({
        next: (res) => this.status = res,
        error: (err) => console.error('Error al obtener estado', err)
      });
    }
  }
}
