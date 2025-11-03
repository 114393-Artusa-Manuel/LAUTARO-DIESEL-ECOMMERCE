import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrls: ['./carrito.css']
})
export class Carrito implements OnInit {
  private cart = inject(CartService);
  items$ = this.cart.items$;
  total$ = this.cart.totalPrice$;

  ngOnInit(): void {}

  remove(id: any) { this.cart.remove(id); }
  update(id: any, q: number) { this.cart.updateQuantity(id, Math.max(0, Math.floor(q))); }
  clear() { this.cart.clear(); }

  trackByProduct = (_: number, it: any) =>
  this.getProdId(it);

getProdId(it: any): string | undefined {
  const p = it?.product;
  const c = p?.idProducto ?? p?.id ?? p?.productoId ?? p?.productoID ?? p?._id ?? p?.codigo ?? p?.slug;
  return c !== undefined && c !== null ? String(c) : undefined;
}

toNumber(ev: Event): number {
  const v = Number((ev.target as HTMLInputElement).value);
  return isNaN(v) ? 1 : v;
}
}
