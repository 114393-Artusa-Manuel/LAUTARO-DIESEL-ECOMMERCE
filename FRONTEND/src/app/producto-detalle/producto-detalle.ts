import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../services/producto.service';
import { CartService } from '../services/cart.service';
import { HttpClient } from '@angular/common/http';

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
  private http = inject(HttpClient);

  product: any = null;
  imagenes: any[] = [];
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
    this.loadImages(id);
  }

  loadProduct(id: any) {
    this.loading = true;
    this.message = '';

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
        const serverMsg = err?.error?.mensaje ?? err?.message ?? null;
        const status = err?.status ?? null;
        this.message = 'No se pudo cargar el producto' + (status ? ` (código ${status})` : '') + (serverMsg ? `: ${serverMsg}` : '.');
      }
    });
  }

  loadImages(id: any) {
    this.http.get<any[]>(`http://localhost:8080/api/imagenes-producto/${id}`).subscribe({
      next: (data) => {
        this.imagenes = data;
        console.debug('📸 Imágenes del producto:', this.imagenes);
      },
      error: (err) => {
        console.error('Error al cargar imágenes del producto', err);
      }
    });
  }

  addToCart() {
    if (!this.product) return;
    const q = Math.max(1, Math.floor(this.qty || 1));
    this.cart.addItem(this.product, q);
    this.router.navigateByUrl('/carrito');
  }

  goBack() {
    history.back();
  }
}
