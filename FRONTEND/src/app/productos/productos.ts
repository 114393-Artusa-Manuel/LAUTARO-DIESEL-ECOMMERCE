import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../services/producto.service';
import { CategoriaService } from '../services/categoria.service';
import { MarcaService } from '../services/marca.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private marcaService = inject(MarcaService);
  private cart = inject(CartService);

  products: any[] = [];
  categorias: any[] = [];
  marcas: any[] = [];

  loading = false;
  message = '';

  // filtros
  filtroNombre: string = '';
  filtroCategoriaId?: number;
  filtroMarcaId?: number;

  ngOnInit(): void {
    this.loadFiltros();
    this.loadProducts();
  }

  loadFiltros() {
    this.categoriaService.getAll().subscribe({
      next: (res: any) => (this.categorias = res?.data ?? res ?? []),
      error: (err: any) => console.error('Error al cargar categorías', err)
    });

    this.marcaService.getAll().subscribe({
      next: (res: any) => (this.marcas = res?.data ?? res ?? []),
      error: (err: any) => console.error('Error al cargar marcas', err)
    });
  }

  loadProducts() {
    this.loading = true;
    const params = {
      nombre: this.filtroNombre?.trim() || undefined,
      categoriaId: this.filtroCategoriaId || undefined,
      marcaId: this.filtroMarcaId || undefined
    };

    this.productoService.getFiltered(params).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.products = res?.data ?? [];
        if (!this.products.length) {
          this.message = 'No se encontraron productos con los filtros aplicados.';
        } else {
          this.message = '';
        }
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error al cargar productos', err);
        this.message = 'Error al cargar productos.';
      }
    });
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCategoriaId = undefined;
    this.filtroMarcaId = undefined;
    this.loadProducts();
  }

  addToCart(p: any) {
    if (!p) return;
    this.cart.addItem(p, 1);
  }

  getProductId(p: any): any {
    return (
      p?.idProducto ??
      p?.id ??
      p?.productoId ??
      p?.productoID ??
      p?._id ??
      p?.codigo ??
      p?.slug ??
      null
    );
  }

  hasProductId(p: any): boolean {
    const id = this.getProductId(p);
    return id !== null && id !== undefined && String(id).trim() !== '';
  }

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
