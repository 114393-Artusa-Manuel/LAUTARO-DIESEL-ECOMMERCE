import { Component, OnInit, inject } from '@angular/core';
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

  irAPagar(items: any[]) {
    const orderId = crypto.randomUUID();
    //const orderId = this.ordenIdActual;
    const buyer = this.testBuyers[Math.floor(Math.random() * this.testBuyers.length)];

    const req = {
      orderId,
      payerEmail: buyer,
      currency: 'ARS',
      items: items.map((i) => ({
        id: i.product.idProducto,
        title: i.product.nombre,
        quantity: i.quantity,
        unitPrice: i.finalPrice ?? i.product.precio,
      })),
    };

    this.pago.crearPreferencia(req).subscribe((res) => {
      sessionStorage.setItem('orderId', orderId);
      window.location.href = res.initPoint;
    });
  }

  // ============================================================
  // 🛑 CONFIRMAR COMPRA — BLOQUEO DE DOBLE CLICK
  // ============================================================
  // 🚫 Bloquea el botón permanentemente después de confirmar
  compraConfirmada: boolean = false;

  async confirmarCompra() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      await this.cart.confirmarCompra(); // descuenta stock con tu backend 👍
      this.compraConfirmada = true; // 🔒 bloqueo permanente
    } catch (err) {
      console.error('Error confirmando compra:', err);
    } finally {
      this.isProcessing = false; // vuelve a texto normal del botón
    }
  }

  toNumber(ev: Event): number {
    const v = Number((ev.target as HTMLInputElement).value);
    return isNaN(v) ? 1 : v;
  }
}
