import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagoService } from '../services/pago.service';
import { environment } from '../../environments/environment';

declare var MercadoPago: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container py-5 text-center">
    <h2 class="mb-4">💰 Pago con Mercado Pago</h2>
    <button class="btn btn-primary btn-lg" (click)="pagar()">Ir al Checkout</button>

    <div *ngIf="loading" class="mt-4 text-info">Creando preferencia...</div>
    <div *ngIf="error" class="mt-4 text-danger">{{ error }}</div>
  </div>
  `
})
export class CheckoutComponent implements OnInit {
  loading = false;
  error = '';

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    // Asegurar que el SDK esté cargado
    if (!(window as any).MercadoPago) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => console.log('✅ SDK de Mercado Pago cargado');
      document.body.appendChild(script);
    }
  }

  pagar(): void {
    this.loading = true;
    this.error = '';

    // 🔹 Generar un ID de orden ficticio (en la práctica usarás el real)
    const orderId = crypto.randomUUID();

    const req = {
      orderId,
      payerEmail: 'test_user_5003766021310630121@testuser.com', // correo de prueba
      currency: 'ARS',
      items: [
        { id: 'P001', title: 'Filtro de aceite', quantity: 1, unitPrice: 20000 },
        { id: 'P002', title: 'Bujía NGK', quantity: 2, unitPrice: 4500 }
      ]
    };

    this.pagoService.crearPreferencia(req).subscribe({
      next: (res: any) => {
        this.loading = false;
        sessionStorage.setItem('orderId', orderId);
        this.abrirCheckout(res.preferenceId);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Error al crear preferencia. Intente nuevamente.';
      }
    });
  }

  abrirCheckout(preferenceId: string): void {
    const mp = new (window as any).MercadoPago(environment.mpPublicKey, { locale: 'es-AR' });
    mp.checkout({
      preference: { id: preferenceId },
      autoOpen: true, // Abre automáticamente el modal
    });
  }
}
