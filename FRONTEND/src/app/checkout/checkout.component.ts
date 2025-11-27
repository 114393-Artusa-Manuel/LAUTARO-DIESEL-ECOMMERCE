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

  // 👇 INYECCIÓN CORRECTA
  pagoService = inject(PagoService);
  cart = inject(CartService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => console.log('SDK MP cargado');
    document.body.appendChild(script);
  }

  async pagar() {
    this.loading = true;

    // 1️⃣ Tomar items del carrito para crear la orden
    const itemsCarrito = this.cart.getItemsSnapshot().map((i: any) => ({
      idProducto: i.product.idProducto,
      cantidad: i.quantity,
    }));

    const resp = await fetch(`${environment.backendBaseUrl}/api/ordenes/confirmar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsCarrito }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      this.loading = false;
      this.error = data.mensaje || 'Error al generar orden';
      return;
    }

    const orderId = data.data;
    sessionStorage.setItem('orderId', orderId.toString());

    console.log('🧾 Orden creada con ID:', orderId);

    // 2️⃣ Crear preferencia MP con datos reales
    this.pagoService
      .crearPreferencia({
        orderId,
        payerEmail: 'test_user_161410446626707035@testuser.com',
        currency: 'ARS',
        items: this.cart.getItemsSnapshot().map((i: any) => ({
          id: i.product.idProducto,
          title: i.product.nombre,
          quantity: i.quantity,
          unitPrice: i.finalPrice ?? i.product.precio,
        })),
      })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          localStorage.removeItem('carritoMp');
          window.location.href = res.initPoint;
        },
        error: () => {
          this.loading = false;
          this.error = 'Error al crear preferencia';
        },
      });
  }
}
