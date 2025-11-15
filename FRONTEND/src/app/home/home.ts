import { Component, inject } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LOCALE_ID } from '@angular/core';
import esAR from '@angular/common/locales/es-AR';

import { CartService } from '../services/cart.service';
import { NotificationService } from '../services/notification.service';
import { ProductoService } from '../services/producto.service';
import { MarcaService } from '../services/marca.service';
import { CategoriaService } from '../services/categoria.service';

registerLocaleData(esAR);

type Category = { id:number; name:string; icon?:string };
type Product  = { id:number; name:string; price:number; img:string; badge?:string; categoryId:number };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
})
export class Home {
  private cart = inject(CartService);
  private notify = inject(NotificationService);
  private productoService = inject(ProductoService);
  private marcaService = inject(MarcaService);
  private categoriaService = inject(CategoriaService);

  q = '';
  activeCategory: number | 'all' = 'all';
  selectedMarcaId: number | string | null = null;
  onlyOffers = false;
  currentYear = new Date().getFullYear();
  loading = false;
  message = '';

  categories: Category[] = [
    // kept as fallback; real categories will be loaded from backend into `categorias`
    { id: 1, name: 'Inyección' },
    { id: 2, name: 'Turbos' },
    { id: 3, name: 'Filtros' },
    { id: 4, name: 'Baterías' },
    { id: 5, name: 'Seguridad' },
  ];

  // backend-loaded lists
  marcas: any[] = [];
  categorias: any[] = [];

  products: any[] = [];

  constructor() {
    this.loadProducts();
    this.loadMeta();
  }

  loadMeta() {
    // load marcas
    this.marcaService.getAll().subscribe({
      next: (res: any) => {
        // backend may wrap responses
        const data = res?.data ?? res ?? [];
        this.marcas = Array.isArray(data) ? data : (data.content ?? []);
      },
      error: () => {
        // ignore silently for now
      }
    });

    // load categorias
    this.categoriaService.getAll().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.categorias = Array.isArray(data) ? data : (data.content ?? []);
      },
      error: () => {}
    });
  }

  loadProducts() {
    this.loading = true;
    this.message = '';
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
        this.message = 'No se pudieron cargar los productos desde el servidor.';
      }
    });
  }

  get filteredProducts(): any[] {
    const t = this.q.trim().toLowerCase();
    return this.products.filter(p => {
      // category match: support different shapes
      const catMatch = this.activeCategory === 'all' ||
        p.categoryId === this.activeCategory ||
        (p.categorias && Array.isArray(p.categorias) && p.categorias.some((c:any) => c.id === this.activeCategory)) ||
        (p.categoriasIds && Array.isArray(p.categoriasIds) && p.categoriasIds.includes(this.activeCategory as any));

      // marca match
      const marcaMatch = !this.selectedMarcaId ||
        (p.marcas && Array.isArray(p.marcas) && p.marcas.some((m:any) => String(m.id ?? m.idMarca ?? m) === String(this.selectedMarcaId))) ||
        (p.marcasIds && Array.isArray(p.marcasIds) && p.marcasIds.map(String).includes(String(this.selectedMarcaId)));

      const name = this.getName(p).toLowerCase();
      const textMatch = !t || name.includes(t);
      const ofertaMatch = !this.onlyOffers || p.badge === 'OFERTA';

      return catMatch && marcaMatch && textMatch && ofertaMatch;
    });
  }

  // pick first 3 as carousel slides (or less)
  get carouselSlides(): Product[] {
    return this.products.slice(0, 3);
  }

  setCategory(cat: number | 'all') { this.activeCategory = cat; }
  toggleOffers() { this.onlyOffers = !this.onlyOffers; }

  setBrand(marcaId: number | string | null) {
    this.selectedMarcaId = marcaId;
  }

  addToCart(p: Product) {
    this.cart.addItem(p, 1);
    const name = p?.name ?? 'Producto';
    this.notify.push(`${name} agregado al carrito.`, 'success', 2200);
  }

  hasNovedades(): boolean {
    return Array.isArray(this.products) && this.products.some(p => p.badge === 'NUEVO');
  }

  // Safe accessors to handle varying backend shapes and avoid 'undefined' in templates
  getName(p: any): string {
    return p?.name ?? p?.titulo ?? p?.nombre ?? p?.productName ?? 'Sin nombre';
  }

  getImg(p: any): string {
    if (!p) return 'assets/no-image.png';
    return (
      p?.img || p?.image || p?.imagen || p?.imagenes?.[0] || p?.images?.[0] || 'assets/no-image.png'
    );
  }

  getPrice(p: any): number {
    const v = p?.price ?? p?.precio ?? p?.valor ?? p?.precioFinal ?? p?.precioVenta ?? 0;
    if (typeof v === 'string') {
      const n = Number(v.replace(/[^0-9.-]+/g, ''));
      return Number.isFinite(n) ? n : 0;
    }
    return typeof v === 'number' ? v : 0;
  }

  // Return a stable unique key for ngFor trackBy. Use provided id fields or fallback to index.
  getId(p: any, index?: number): string {
    const id = p?.id ?? p?._id ?? p?.codigo ?? p?.sku ?? p?.serial ?? null;
    if (id || id === 0) return String(id);
    // fallback to a predictable index-based key
    return `_idx_${index ?? 0}`;
  }
    search() {
    const t = this.q.trim().toLowerCase();

    // si solo querés mostrar un mensajito cuando no encuentra nada:
    if (t && this.filteredProducts.length === 0) {
      this.message = 'No encontramos productos para esa búsqueda.';
    } else {
      this.message = '';
    }
  }

}
