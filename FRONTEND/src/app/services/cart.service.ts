import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, combineLatest, firstValueFrom } from 'rxjs';
import { NotificationService } from './notification.service';
import { DiscountService } from './discount.service';

export interface CartItem {
  product: any;
  quantity: number;
  discount?: number;      // % de descuento aplicado
  finalPrice?: number;    // precio final calculado
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'ecom_cart_v1';
  private notification = inject(NotificationService);
  private discountService = inject(DiscountService);

  private itemsSubject = new BehaviorSubject<CartItem[]>(this._readFromStorage());
  items$ = this.itemsSubject.asObservable();

  // 🔹 Total de productos (para el navbar)
  totalCount$ = this.items$.pipe(
    map(items => items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0))
  );

  // 🔹 Subtotal sin descuentos
  subtotal$ = this.items$.pipe(
    map(items =>
      items.reduce(
        (sum, i) => sum + ((Number(i.product?.precio) || 0) * (Number(i.quantity) || 1)),
        0
      )
    )
  );

  // 🔹 Descuento total (combina descuento del producto + descuento de segmento)
  discount$ = this.items$.pipe(
    map(items => {
      let totalDiscount = 0;
      for (const i of items) {
        const base = (Number(i.product?.precio) || 0) * (Number(i.quantity) || 1);
        const discountPercent = i.discount ?? i.product?.descuento ?? 0;
        totalDiscount += base * (discountPercent / 100);
      }
      return totalDiscount;
    })
  );

  // 🔹 Total final
  total$ = combineLatest([this.subtotal$, this.discount$]).pipe(
    map(([subtotal, discount]) => subtotal - discount)
  );

  // =====================================================
  // 🧠 SCRUM-27 + SCRUM-28
  // =====================================================

  /**
   * Aplica descuentos dinámicos desde el backend.
   * @param userId id del usuario autenticado (para reglas por segmento)
   */
  async applyDiscounts(userId: number) {
    try {
      const res: any = await firstValueFrom(this.discountService.getActiveDiscounts(userId));
      const descuentos = res.data || [];

      const updatedItems = this.getItemsSnapshot().map(item => {
        const match = descuentos.find((d: any) =>
          (!d.idCategoria || d.idCategoria === item.product.categoriaId) &&
          (!d.idUsuario || d.idUsuario === userId)
        );
        if (match) {
          const descuento = match.porcentaje || 0;
          item.discount = descuento;
          item.finalPrice = item.product.precio * (1 - descuento / 100);
        } else {
          item.discount = item.product?.descuento ?? 0;
          const base = Number(item.product?.precio) || 0;
          const pct  = Number(item.discount ?? 0);   // <- default 0
          item.finalPrice = base * (1 - pct / 100);

        }
        return item;
      });

      this._save(updatedItems);
      this.notification.push('Descuentos aplicados automáticamente ✅', 'success', 2500);
    } catch (err) {
      console.error('Error aplicando descuentos automáticos', err);
      this.notification.push('No se pudieron aplicar descuentos ❌', 'error', 3000);
    }
  }

  // =====================================================

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
    } catch {}
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
            quantity: Math.max(1, Number(it?.quantity) || 1),
            discount: it?.discount ?? 0,
            finalPrice: it?.finalPrice ?? it?.product?.precio
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

  // Confirmar compra
  async confirmarCompra() {
    const items = this.getItemsSnapshot().map(i => ({
      idProducto: i.product?.idProducto,
      cantidad: i.quantity
    }));

    try {
      const res = await fetch('http://localhost:8080/api/ordenes/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        this.notification.push('Compra confirmada correctamente ✅', 'success', 3000);
        this.clear();
      } else {
        this.notification.push(
          data.mensaje || `Error al confirmar compra ❌ (Código ${res.status})`,
          'error',
          4000
        );
      }

      return data;
    } catch (error) {
      console.error('Error de red al confirmar compra:', error);
      this.notification.push('No se pudo conectar con el servidor ❌', 'error', 4000);
      throw error;
    }
  }
}
