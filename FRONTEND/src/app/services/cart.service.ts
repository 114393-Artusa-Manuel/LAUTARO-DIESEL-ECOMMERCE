import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, combineLatest } from 'rxjs';
import { NotificationService } from './notification.service';

export interface CartItem {
  product: any;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'ecom_cart_v1';
  private notification = inject(NotificationService);

  private itemsSubject = new BehaviorSubject<CartItem[]>(this._readFromStorage());
  items$ = this.itemsSubject.asObservable();

  // 🔹 NUEVO: cantidad total de productos (observable para el navbar)
  totalCount$ = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0))
  );

  // subtotal (sin descuentos)
  subtotal$ = this.items$.pipe(
    map(items =>
      items.reduce(
        (sum, i) => sum + ((Number(i.product?.precio) || 0) * (Number(i.quantity) || 1)),
        0
      )
    )
  );

  // descuentos simulados (en el futuro vendrán del backend)
  discount$ = this.items$.pipe(
    map(items => {
      let totalDiscount = 0;
      for (const i of items) {
        const base = (Number(i.product?.precio) || 0) * (Number(i.quantity) || 1);
        // ejemplo: aplicar 10% si el producto tiene p.descuento = 10
        if (i.product?.descuento && i.product.descuento > 0) {
          totalDiscount += base * (i.product.descuento / 100);
        }
      }
      return totalDiscount;
    })
  );

  // total final (subtotal - descuento)
  total$ = combineLatest([this.subtotal$, this.discount$]).pipe(
    map(([subtotal, discount]) => subtotal - discount)
  );

  addItem(product: any, quantity = 1) {
    if (!product) return;
    const id = this._getId(product);
    if (!id) return;

    const items = [...this.itemsSubject.getValue()];
    const ix = items.findIndex(i => this._getId(i.product) === id);

    if (ix >= 0) {
      const q = (Number(items[ix].quantity) || 0) + (Number(quantity) || 1);
      items[ix] = { ...items[ix], quantity: Math.max(1, q) };
    } else {
      items.push({ product, quantity: Math.max(1, Number(quantity) || 1) });
    }
    this._save(items);
    try {
      const name = product?.nombre ?? product?.titulo ?? product?.name ?? 'Producto';
      this.notification.push(`${name} agregado al carrito.`, 'success', 2500);
    } catch {
      // ignore
    }
  }

  updateQuantity(productId: any, quantity: number) {
    const key = this._toKey(productId);
    if (!key) return;

    const items = [...this.itemsSubject.getValue()];
    const ix = items.findIndex(i => this._getId(i.product) === key);
    if (ix < 0) return;

    const q = Math.max(0, Math.floor(Number(quantity) || 0));
    if (q === 0) items.splice(ix, 1);
    else items[ix] = { ...items[ix], quantity: q };

    this._save(items);
  }

  remove(productId: any) {
    const key = this._toKey(productId);
    if (!key) return;

    const items = this.itemsSubject.getValue().filter(i => this._getId(i.product) !== key);
    this._save(items);
  }

  clear() {
    this._save([]);
  }

  getItemsSnapshot(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  /** Helpers */
  private _save(items: CartItem[]) {
    this.itemsSubject.next(items);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  private _readFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((it: any) => ({
            product: it?.product,
            quantity: Math.max(1, Number(it?.quantity) || 1)
          }))
        : [];
    } catch {
      return [];
    }
  }

  private _getId(p: any): string | null {
    const cand = [
      p?.idProducto,
      p?.id,
      p?.productoId,
      p?.productoID,
      p?._id,
      p?.codigo,
      p?.slug
    ];
    const first = cand.find(v => v !== null && v !== undefined && String(v).trim() !== '');
    return first !== undefined ? String(first).trim() : null;
  }

  private _toKey(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s ? s : null;
  }

  confirmarCompra() {
  const items = this.getItemsSnapshot().map(i => ({
    idProducto: i.product?.idProducto,
    cantidad: i.quantity
  }));

  return fetch('http://localhost:8080/api/ordenes/confirmar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  })
  .then(async res => {
    const data = await res.json();
    if (res.ok) {
      this.notification.push('Compra confirmada correctamente ✅', 'success', 3000);
      this.clear();
    } else {
      this.notification.push(data.mensaje || 'Error al confirmar compra ❌', 'error', 3000);
    }
    return data;
  });
}

}
