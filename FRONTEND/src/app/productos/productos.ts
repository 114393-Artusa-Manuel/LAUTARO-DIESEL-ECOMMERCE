
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../services/producto.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {
  private productoService = inject(ProductoService);
  private cart = inject(CartService);

  products: any[] = [];
  loading = false;
  message = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (Array.isArray(res)) this.products = res;
        else if (res?.data && Array.isArray(res.data)) this.products = res.data;
        else if (res?.data?.content && Array.isArray(res.data.content)) this.products = res.data.content;
        else this.products = res?.data ?? res ?? [];
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Failed to load products', err);
        this.message = 'No se pudieron cargar los productos';
      }
    });
  }

  addToCart(p: any) {
    if (!p) return;
    this.cart.addItem(p, 1);
  }

  /**
   * Try several common id/property names to produce a stable id to route by.
   */
  getProductId(p: any): any {
  return p?.idProducto ?? p?.id ?? p?.productoId ?? p?.productoID ?? p?._id ?? p?.codigo ?? p?.slug ?? null;
}

  /**
   * Returns true when a usable id exists (including 0). This avoids treating 0 as falsy in templates.
   */
  hasProductId(p: any): boolean {
  const id = this.getProductId(p);
  // permití 0 si alguna API lo usa
  return id !== null && id !== undefined && String(id).trim() !== '';
}

  /**
   * Small debug helper: return a compact string describing id candidates and top-level keys.
   */
  getDebugInfo(p: any): string {
    try {
      if (!p) return '';
      const id = this.getProductId(p);
      if (id !== null && id !== undefined) return `id=${String(id)}`;
      const keys = Object.keys(p || {}).slice(0, 6);
      return `keys=${keys.join(',')}`;
    } catch (e) {
      return '';
    }
  }
}
