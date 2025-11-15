import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PagoService } from '../services/pago.service';
import { environment } from '../../environments/environment';
import { PLATFORM_ID } from '@angular/core';

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
  private platformId = inject(PLATFORM_ID);

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    // Only manipulate DOM in browser
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const w = window as any;
      if (!w.MercadoPago) {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => console.log('✅ SDK de Mercado Pago cargado');
        document.body.appendChild(script);
      }
    } catch (err) {
      console.warn('No se pudo insertar script de MercadoPago en SSR', err);
    }
  }

  pagar(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.error = 'El pago solo está disponible en el navegador.';
      return;
    }

    this.loading = true;
    this.error = '';

    // Generar un ID de orden con fallback
    const orderId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : 'ord_' + Date.now();

    const req = {
      orderId,
      payerEmail: 'test_user_123456@testuser.com',
      currency: 'ARS',
      items: [
        { id: 'P001', title: 'Filtro de aceite', quantity: 1, unitPrice: 20000 },
        { id: 'P002', title: 'Bujía NGK', quantity: 2, unitPrice: 4500 }
      ]
    };

    this.pagoService.crearPreferencia(req).subscribe({
      next: (res: any) => {
        this.loading = false;
        try { sessionStorage.setItem('orderId', orderId); } catch {}
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
    if (!isPlatformBrowser(this.platformId)) {
      this.error = 'El checkout solo puede abrirse en el navegador.';
      return;
    }

    const w = window as any;
    if (!w.MercadoPago) {
      this.error = 'El SDK de MercadoPago no está disponible aún. Recargue la página e intente de nuevo.';
      return;
    }

    try {
      const mp = new w.MercadoPago(environment.mpPublicKey, { locale: 'es-AR' });
      mp.checkout({ preference: { id: preferenceId }, autoOpen: true });
    } catch (err) {
      console.error('Error al abrir checkout', err);
      this.error = 'No se pudo abrir el checkout. Intente nuevamente.';
    }
  }
}
