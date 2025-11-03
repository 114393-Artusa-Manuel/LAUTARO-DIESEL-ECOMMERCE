import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../services/producto.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './producto-detalle.html',
  styleUrls: ['./producto-detalle.css']
})
export class ProductoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private cart = inject(CartService);
  private router = inject(Router);

  product: any = null;
  loading = false;
  message = '';
  qty = 1;
  currentId: any = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.message = 'Producto no especificado'; return; }
    this.currentId = id;
    console.debug('ProductoDetalle: route id=', id);
    this.loadProduct(id);
  }

  loadProduct(id: any) {
    this.loading = true;
    this.message = '';

    // Normalize id: try to convert to number when possible
    const idStr = String(id ?? '').trim();
    if (!idStr || idStr === 'undefined') {
      this.loading = false;
      this.message = 'ID de producto inválido.';
      return;
    }

    const num = Number(idStr);
    const useId: any = Number.isFinite(num) && idStr.match(/^\d+$/) ? num : idStr;

    console.debug('ProductoDetalle: loading product id ->', useId);

    this.productoService.getById(useId).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.product = res?.data ?? res ?? null;
        if (!this.product) {
          this.message = 'Producto no encontrado.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('failed load product', err);
        // try to show useful information from backend wrapper
        const serverMsg = err?.error?.mensaje ?? err?.message ?? null;
        const status = err?.status ?? null;
        this.message = 'No se pudo cargar el producto' + (status ? ` (código ${status})` : '') + (serverMsg ? `: ${serverMsg}` : '.');
      }
    });
  }

  addToCart() {
    if (!this.product) return;
    const q = Math.max(1, Math.floor(this.qty || 1));
    this.cart.addItem(this.product, q);
    // simple feedback: navigate to cart
    this.router.navigateByUrl('/carrito');
  }

  goBack() {
    // Use the browser history to go back; avoids referencing window from the template
    history.back();
  }
}
