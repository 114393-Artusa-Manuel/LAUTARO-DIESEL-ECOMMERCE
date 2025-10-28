import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-admin.html',
  styleUrls: ['./productos-admin.css']
})
export class ProductosAdmin implements OnInit {
  // inject ProductoService at field level (valid injection context)
  private productoService = inject(ProductoService);

  products: any[] = [];
  editModel: any = null;
  showCreate = false;

  toggleCreate() {
    this.showCreate = !this.showCreate;
  }

  // form model
  model: any = {
    nombre: '',
    slug: '',
    descripcion: '',
    activo: true,
    marcasIds: '', // comma-separated in form
    categoriasIds: '' // comma-separated in form
  };

  loading = false;
  message = '';

  create() {
    this.message = '';
    // normalize and validate ids fields before sending
    const normMarcas = this.normalizeIdsField(this.model.marcasIds);
    const normCategorias = this.normalizeIdsField(this.model.categoriasIds);
    if (normMarcas.invalid.length || normCategorias.invalid.length) {
      const parts: string[] = [];
      if (normMarcas.invalid.length) parts.push(`marcasIds inválidos: ${normMarcas.invalid.join(', ')}`);
      if (normCategorias.invalid.length) parts.push(`categoriasIds inválidos: ${normCategorias.invalid.join(', ')}`);
      this.message = `No se enviaron los datos: ${parts.join(' ; ')}`;
      return;
    }

    const slug = (this.model.slug || '').toString().trim() || `producto-${Date.now()}`;
    const payload = {
      nombre: (this.model.nombre || '').toString().trim(),
      slug,
      descripcion: (this.model.descripcion || '').toString().trim(),
      activo: !!this.model.activo,
      marcasIds: normMarcas.ids,
      categoriasIds: normCategorias.ids
    };
    this.loading = true;
    this.productoService.create(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.mensaje ?? 'Producto creado';
        // reset form
        this.model = { nombre: '', slug: '', descripcion: '', activo: true, marcasIds: '', categoriasIds: '' };
        this.loadProducts();
        this.showCreate = false;
      },
      error: (err: any) => {
        this.loading = false;
        // show richer diagnostic info to help debug 500 errors from backend
        console.error('Producto create error', err);
        const status = err?.status ?? 'unknown';
        const statusText = err?.statusText ? ` ${err.statusText}` : '';
        const body = err?.error ?? err;
        let serverMsg = '';
        try {
          serverMsg = body?.mensaje ?? (typeof body === 'string' ? body : JSON.stringify(body));
        } catch (e) {
          serverMsg = String(body);
        }
        this.message = `Error ${status}${statusText} — ${serverMsg}`;
      }
    });
  }

  /**
   * Helper: submit a minimal product payload (no marcas/categorias) to test backend behavior.
   */
  createMinimal() {
    this.message = '';
    const payload = {
      nombre: this.model.nombre || 'Prueba minimal',
      slug: this.model.slug || `prueba-minimal-${Date.now()}`,
      descripcion: this.model.descripcion || '',
      activo: this.model.activo ?? true,
      marcasIds: [],
      categoriasIds: []
    };
    this.loading = true;
    this.productoService.create(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.mensaje ?? 'Producto (minimal) creado';
        this.loadProducts();
        this.showCreate = false;
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Producto minimal create error', err);
        const status = err?.status ?? 'unknown';
        const statusText = err?.statusText ? ` ${err.statusText}` : '';
        const body = err?.error ?? err;
        let serverMsg = '';
        try {
          serverMsg = body?.mensaje ?? (typeof body === 'string' ? body : JSON.stringify(body));
        } catch (e) {
          serverMsg = String(body);
        }
        this.message = `Error ${status}${statusText} — ${serverMsg}`;
      }
    });
  }

  /**
   * Normalize an incoming field into an array of numbers and report any invalid tokens.
   * Accepts arrays, comma-separated strings, JSON arrays, objects with id fields, etc.
   */
  private normalizeIdsField(v: any): { ids: number[]; invalid: string[] } {
    if (v == null) return { ids: [], invalid: [] };

    // If already an array, iterate
    if (Array.isArray(v)) {
      const ids: number[] = [];
      const invalid: string[] = [];
      v.forEach((item) => {
        if (item == null) return;
        if (typeof item === 'number') {
          if (!isNaN(item)) ids.push(item);
          else invalid.push(String(item));
          return;
        }
        if (typeof item === 'string') {
          const n = Number(item.trim());
          if (!isNaN(n)) ids.push(n);
          else {
            const m = item.match(/-?\d+/);
            if (m) ids.push(Number(m[0]));
            else invalid.push(item);
          }
          return;
        }
        if (typeof item === 'object') {
          const candidate = (item as any).id ?? (item as any).Id ?? (item as any).codigo ?? (item as any).nombre;
          if (candidate != null) {
            const n = Number(candidate);
            if (!isNaN(n)) ids.push(n);
            else {
              const m = String(candidate).match(/-?\d+/);
              if (m) ids.push(Number(m[0]));
              else invalid.push(JSON.stringify(item));
            }
          } else {
            invalid.push(JSON.stringify(item));
          }
          return;
        }
        invalid.push(String(item));
      });
      return { ids, invalid };
    }

    // If string, try to parse JSON arrays first
    if (typeof v === 'string') {
      const s = v.trim();
      if (!s) return { ids: [], invalid: [] };
      if (s.startsWith('[') || s.startsWith('{')) {
        try {
          const parsed = JSON.parse(s);
          return this.normalizeIdsField(parsed);
        } catch (e) {
          // fall through to comma parsing
        }
      }
      const parts = s.split(',').map(p => p.trim()).filter(Boolean);
      const ids: number[] = [];
      const invalid: string[] = [];
      parts.forEach((t) => {
        const n = Number(t);
        if (!isNaN(n)) ids.push(n);
        else {
          const m = t.match(/-?\d+/);
          if (m) ids.push(Number(m[0]));
          else invalid.push(t);
        }
      });
      return { ids, invalid };
    }

    // If object (single), try to extract numeric id
    if (typeof v === 'object') {
      return this.normalizeIdsField([v]);
    }

    // Fallback
    return { ids: [], invalid: [String(v)] };
  }

  // load list of products
  loadProducts() {
    this.productoService.getAll().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) this.products = res;
        else if (res?.data && Array.isArray(res.data)) this.products = res.data;
        else if (res?.data?.content && Array.isArray(res.data.content)) this.products = res.data.content;
        else this.products = res?.data ?? res ?? [];
      },
      error: (err: any) => {
        console.error('Failed to load products', err);
        this.message = 'No se pudieron cargar los productos';
      }
    });
  }

  edit(product: any) {
    this.editModel = { ...product };
  }

  cancelEdit() {
    this.editModel = null;
  }

  saveEdit() {
    if (!this.editModel) return;
    const id = this.editModel.idProducto ?? this.editModel.id;
    if (!id) return;
    const payload = {
      nombre: (this.editModel.nombre || '').toString().trim(),
      slug: (this.editModel.slug || '').toString().trim() || `producto-${Date.now()}`,
      descripcion: (this.editModel.descripcion || '').toString().trim(),
      activo: !!this.editModel.activo,
      marcasIds: this.normalizeIdsField(this.editModel.marcasIds).ids,
      categoriasIds: this.normalizeIdsField(this.editModel.categoriasIds).ids
    };
    this.loading = true;
    this.productoService.update(id, payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.mensaje ?? 'Producto actualizado';
        this.editModel = null;
        this.loadProducts();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Producto update error', err);
        this.message = `Error al actualizar: ${err?.message ?? err}`;
      }
    });
  }

  delete(product: any) {
    const id = product.idProducto ?? product.id;
    if (!id) { this.message = 'ID no encontrado'; return; }
    if (!confirm(`¿Eliminar producto ${product.nombre || id}?`)) return;
    this.loading = true;
    this.productoService.delete(id).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.mensaje ?? 'Producto eliminado';
        this.loadProducts();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Producto delete error', err);
        this.message = `Error al eliminar: ${err?.message ?? err}`;
      }
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }
}
