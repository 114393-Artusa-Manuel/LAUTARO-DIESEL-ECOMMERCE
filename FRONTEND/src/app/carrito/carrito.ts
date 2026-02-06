import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { PagoService } from '../services/pago.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css'],
})
export class Carrito implements OnInit {
  cart = inject(CartService);
  pago = inject(PagoService);

  items$ = this.cart.items$;
  total$ = this.cart.total$;
  stockErrorMsg: string | null = null;

  private readonly userId = 4;

  // 🔐 Evita doble click en Confirmar compra
  isProcessing: boolean = false;

  ngOnInit(): void {
    this.cart.applyDiscounts(this.userId);
  }

  remove(id: any) {
    this.cart.remove(id);
  }

  update(id: any, q: number) {
    this.cart.updateQuantity(id, Math.max(0, Math.floor(q)));
  }

  clear() {
    this.cart.clear();
  }

  trackByProduct = (_: number, it: any) => this.getProdId(it);

  getProdId(it: any): string | undefined {
    const p = it?.product;
    const c =
      p?.idProducto ?? p?.id ?? p?.productoId ?? p?.productoID ?? p?._id ?? p?.codigo ?? p?.slug;

    return c !== undefined && c !== null ? String(c) : undefined;
  }

  // ============================================================
  // 🚀 MÉTODO PARA CREAR LA PREFERENCIA Y REDIRIGIR A MERCADO PAGO
  // ============================================================

  // Emails test que ya tenés en tu cuenta de MercadoPago
  readonly testBuyers = [
    'test_user_73663551382686826247@testuser.com',
    'test_user_161410446626707035@testuser.com',
  ];

  async irAPagar(items: any[]) {
    try {
      // 1️⃣ Crear la orden con estado PENDIENTE
      const respOrden = await fetch('http://localhost:8080/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            idProducto: i.product.idProducto,
            cantidad: i.quantity,
          })),
        }),
      });

      const orderId = await respOrden.json(); // <- ID real devuelto por backend
      sessionStorage.setItem('orderId', orderId.toString());

      console.log('🧾 Orden creada con ID:', orderId);

      // 2️⃣ Crear preferencia MercadoPago
      this.pago
        .crearPreferencia({
          orderId,
          payerEmail: 'test_user_73663551382686826247@testuser.com',
          currency: 'ARS',
          items: items.map((i) => ({
            id: i.product.idProducto,
            title: i.product.nombre,
            quantity: i.quantity,
            unitPrice: i.finalPrice ?? i.product.precio,
          })),
        })
        .subscribe((res) => {
          window.location.href = res.initPoint;
        });
    } catch (e) {
      console.error('❌ Error creando la orden o preferencia:', e);
    }
  }

  // ============================================================
  // 🛑 CONFIRMAR COMPRA — BLOQUEO DE DOBLE CLICK
  // ============================================================
  // 🚫 Bloquea el botón permanentemente después de confirmar
  compraConfirmada: boolean = false;

  zone = inject(NgZone);

  async confirmarCompra() {
    if (this.isProcessing) return;

    this.zone.run(() => {
      this.isProcessing = true;
      this.stockErrorMsg = null;
    });

    try {
      await this.cart.confirmarCompra();

      this.zone.run(() => {
        this.compraConfirmada = true;
        this.stockErrorMsg = null;
      });
    } catch (err: any) {
      this.zone.run(() => {
        this.compraConfirmada = false;
        this.stockErrorMsg = err?.message || 'No hay stock suficiente para completar la compra.';
      });
    } finally {
      this.zone.run(() => {
        this.isProcessing = false;
      });
    }
  }

  toNumber(ev: Event): number {
    const v = Number((ev.target as HTMLInputElement).value);
    return isNaN(v) ? 1 : v;
  }
}
