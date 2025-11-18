import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { PagoService } from '../services/pago.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css']
})
export class Carrito implements OnInit {
  
  cart = inject(CartService);
  pago = inject(PagoService);   // ✅ NECESARIO PARA MP

  items$ = this.cart.items$;
  total$ = this.cart.total$;

  // ⚠️ Reemplazar luego por el ID real del usuario autenticado
  private readonly userId = 4;

  ngOnInit(): void {
    // aplicar descuentos dinámicos desde el backend
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
      p?.idProducto ??
      p?.id ??
      p?.productoId ??
      p?.productoID ??
      p?._id ??
      p?.codigo ??
      p?.slug;

    return c !== undefined && c !== null ? String(c) : undefined;
  }

  // ============================================================
  // 🚀 MÉTODO PARA CREAR LA PREFERENCIA Y REDIRIGIR A MERCADO PAGO
  // ============================================================
  irAPagar(items: any[]) {
    const orderId = crypto.randomUUID();

    const req = {
      orderId,
      payerEmail: 'test_user_5003766021310630121@testuser.com',
      currency: 'ARS',
      items: items.map(it => ({
        id: this.getProdId(it),          // ✅ ID correcto
        title: it.product.nombre,        // Nombre real del producto
        quantity: it.quantity,           // Cantidad
        unitPrice: it.finalPrice ?? it.product.precio // 💰 Precio final o normal
      }))
    };

    this.pago.crearPreferencia(req).subscribe({
      next: (res: any) => {
        sessionStorage.setItem('orderId', orderId);

        // Redirigir al checkout de Mercado Pago
        window.location.href = res.sandboxInitPoint ?? res.initPoint;
      },
      error: (err) => {
        console.error('❌ Error creando preferencia', err);
        alert('Error creando la preferencia de pago.');
      }
    });
  }

  // convertir string a number
  toNumber(ev: Event): number {
    const v = Number((ev.target as HTMLInputElement).value);
    return isNaN(v) ? 1 : v;
  }
}
