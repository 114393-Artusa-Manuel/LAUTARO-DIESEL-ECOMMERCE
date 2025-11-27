import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PagoService } from '../services/pago.service';
import { environment } from '../../environments/environment';
import { PLATFORM_ID } from '@angular/core';
import { CartService } from '../services/cart.service';

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
  `,
})
export class CheckoutComponent implements OnInit {
  loading = false;
  error = '';
  private platformId = inject(PLATFORM_ID);

  constructor(private pagoService: PagoService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const w = window as any;
      if (!w.MercadoPago) {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => console.log('SDK MercadoPago cargado');
        document.body.appendChild(script);
      }
    } catch {}
  }

  cart = inject(CartService); // 👈 IMPORTANTE

  async pagar() {
    const orderId = sessionStorage.getItem('orderId');
    if (!orderId) {
      this.error = 'No hay una orden generada. Volvé al carrito.';
      return;
    }

    const items = this.cart.getItemsSnapshot(); // <-- ya no dará error

    this.pagoService
      .crearPreferencia({
        orderId,
        payerEmail: 'test_user_73663551382686826247@testuser.com',
        currency: 'ARS',
        items: items.map((i: any) => ({
          id: i.product.idProducto,
          title: i.product.nombre,
          quantity: i.quantity,
          unitPrice: i.finalPrice ?? i.product.precio,
        })),
      })
      .subscribe((res: any) => {
        window.location.href = res.initPoint;
      });
  }
}
