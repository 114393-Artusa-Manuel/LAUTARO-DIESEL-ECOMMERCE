import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../services/producto.service';
import { CartService } from '../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { MarcaService } from '../services/marca.service';
import { CategoriaService } from '../services/categoria.service';

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
  private marcaService = inject(MarcaService);
  private categoriaService = inject(CategoriaService);

  product: any = null;
  imagenes: any[] = [];
  marcasList: any[] = [];
  categoriasList: any[] = [];
  marcaNames = '';
  categoriaNames = '';
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
    // preload marcas/categorias lists to resolve ids -> nombres if needed
    this.loadMarcasList();
    this.loadCategoriasList();
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
        } else {
          // compute human-readable marca/categoria names for the product
          this.computeMarcaCategoriaNames();
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

  private loadMarcasList() {
    this.marcaService.getAll().subscribe({
      next: (res:any) => {
        this.marcasList = Array.isArray(res) ? res : (res?.data ?? res ?? []);
        // recompute if product already loaded
        if (this.product) this.computeMarcaCategoriaNames();
      },
      error: (err:any) => console.warn('No se pudieron cargar marcas', err)
    });
  }

  private loadCategoriasList() {
    this.categoriaService.getAll().subscribe({
      next: (res:any) => {
        this.categoriasList = Array.isArray(res) ? res : (res?.data ?? res ?? []);
        if (this.product) this.computeMarcaCategoriaNames();
      },
      error: (err:any) => console.warn('No se pudieron cargar categorías', err)
    });
  }

  private computeMarcaCategoriaNames() {
    // marcas
    try {
      const p = this.product || {};
      let marcas: any[] = [];
      if (Array.isArray(p.marcas) && p.marcas.length) {
        marcas = p.marcas.map((m:any) => m?.nombre ?? m?.nombreMarca ?? String(m?.idMarca ?? m?.id ?? m));
      } else if (Array.isArray(p.marcasIds) && p.marcasIds.length && this.marcasList.length) {
        marcas = p.marcasIds.map((id:any) => {
          const found = this.marcasList.find((m:any) => (m.idMarca ?? m.id) == id);
          return found ? found.nombre : String(id);
        });
      } else if (Array.isArray(p.marcasIds) && p.marcasIds.length) {
        marcas = p.marcasIds.map((id:any) => String(id));
      }
      this.marcaNames = marcas.filter(Boolean).join(', ');
    } catch (e) {
      console.warn('computeMarcaNames error', e);
      this.marcaNames = '';
    }

    // categorias
    try {
      const p = this.product || {};
      let categorias: any[] = [];
      if (Array.isArray(p.categorias) && p.categorias.length) {
        categorias = p.categorias.map((c:any) => c?.nombre ?? c?.nombreCategoria ?? String(c?.idCategoria ?? c?.id ?? c));
      } else if (Array.isArray(p.categoriasIds) && p.categoriasIds.length && this.categoriasList.length) {
        categorias = p.categoriasIds.map((id:any) => {
          const found = this.categoriasList.find((c:any) => (c.idCategoria ?? c.id) == id);
          return found ? found.nombre : String(id);
        });
      } else if (Array.isArray(p.categoriasIds) && p.categoriasIds.length) {
        categorias = p.categoriasIds.map((id:any) => String(id));
      }
      this.categoriaNames = categorias.filter(Boolean).join(', ');
    } catch (e) {
      console.warn('computeCategoriaNames error', e);
      this.categoriaNames = '';
    }
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
