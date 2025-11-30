import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../services/producto.service';
import { MarcaService } from '../services/marca.service';
import { CategoriaService } from '../services/categoria.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment, environment1 } from '../../environments/environment';

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
  private marcaService = inject(MarcaService);
  private categoriaService = inject(CategoriaService);
  private http = inject(HttpClient);

  products: any[] = [];
  editModel: any = null;
  showCreate = false;

  toggleCreate() {
    this.showCreate = !this.showCreate;
  }

  // lists
  marcasList: any[] = [];
  categoriasList: any[] = [];
  // filtered lists for mini-search
  filteredMarcas: any[] = [];
  filteredCategorias: any[] = [];

  // search / create helpers
  marcaFilter = '';
  categoriaFilter = '';
  private marcaFilterTimer: any = null;
  private categoriaFilterTimer: any = null;
  newMarcaName = '';
  newCategoriaName = '';
  // edit/delete state for marcas/categorias
  marcaEditingId: number | null = null;
  marcaEditingName = '';
  categoriaEditingId: number | null = null;
  categoriaEditingName = '';
  // modal control
  showManageEntitiesModal = false;

  // form model
  model: any = {
    nombre: '',
    slug: '',
    descripcion: '',
    activo: true,
    marcasIds: [], // array of selected marca ids
    categoriasIds: [], // array of selected categoria ids
    precio: null,
    stock: 0,
    descuento: 0,
    moneda: 'ARS',
    varianteActiva: true,
    imagenUrl: ''
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
    const payload: any = {
      nombre: (this.model.nombre || '').toString().trim(),
      slug,
      descripcion: (this.model.descripcion || '').toString().trim(),
      activo: !!this.model.activo,
      marcasIds: normMarcas.ids,
      categoriasIds: normCategorias.ids,
      precio: this.model.precio != null ? Number(this.model.precio) : null,
      moneda: this.model.moneda ? this.model.moneda.toString().trim() : null,
      varianteActiva: this.model.varianteActiva != null ? !!this.model.varianteActiva : null,
      stock: this.model.stock != null ? Number(this.model.stock) : 0,
      descuento: this.model.descuento != null ? Number(this.model.descuento) : 0
    };

    // If the admin provided an imagenUrl, attach it to the payload (backend may or may not persist it).
    const rawUrl = (this.model.imagenUrl || '').toString().trim();
    if (rawUrl) {
      const normalized = this.normalizeImageUrl(rawUrl);
      payload.imagenes = [{ url: normalized, textoAlt: this.model.nombre || '' }];
      // keep legacy single-image field for older backends
      payload.img = normalized;
    }
    this.loading = true;
    this.productoService.create(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.message = res?.mensaje ?? 'Producto creado';
        // try to extract created product id from common response shapes
        const created = res?.data ?? res ?? null;
        const createdId = created?.idProducto ?? created?.id ?? created?.codigo ?? null;

        // If we attached an imagenUrl to the payload, and the backend returned an id, try to persist the image
        if (rawUrl && createdId) {
          const normalized = this.normalizeImageUrl(rawUrl);
          const imgPayload: any = { idProducto: createdId, url: normalized, textoAlt: this.model.nombre || '', orden: 0 };
          this.http.post((environment?.backendBaseUrl || 'http://localhost:8080') + '/api/imagenes-producto', imgPayload).subscribe({
            next: (r:any) => {
              // no-op; we already updated UI below
            },
            error: (e:any) => {
              console.warn('No se pudo persistir imagen automáticamente', e);
              // keep going — product created but image persistence failed
            }
          });
        }

        // reset form
        this.model = { nombre: '', slug: '', descripcion: '', activo: true, marcasIds: [], categoriasIds: [], precio: null, moneda: 'ARS', varianteActiva: true, stock: 0, descuento: 0, imagenUrl: '' };
        // refresh product list in-place for faster UX
        this.loadProducts();
        // close create form
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

  /**
   * Refresh products and append status to `recargaMsg` so the admin sees what happened.
   * This is used specifically after triggering the n8n recarga.
   */
  private refreshProductsReport(tag = '') {
    console.debug('refreshProductsReport', tag);
    this.productoService.getAll().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) this.products = res;
        else if (res?.data && Array.isArray(res.data)) this.products = res.data;
        else if (res?.data?.content && Array.isArray(res.data.content)) this.products = res.data.content;
        else this.products = res?.data ?? res ?? [];
        this.recargaMsg = (this.recargaMsg || '') + ` (${tag} refresh OK)`;
      },
      error: (err: any) => {
        console.error('refreshProductsReport failed', err);
        const body = err?.error ?? err;
        let serverMsg = '';
        try { serverMsg = body?.mensaje ?? body?.message ?? (typeof body === 'string' ? body : JSON.stringify(body)); } catch(e) { serverMsg = String(body); }
        this.recargaMsg = (this.recargaMsg || '') + ` (${tag} refresh ERROR: ${serverMsg})`;
      }
    });
  }

  // Public helper to force a manual refresh from the template/button
  reloadProducts() {
    this.recargaMsg = 'Forzando recarga de lista...';
    this.refreshProductsReport('manual');
  }

  edit(product: any) {
    // Clone and normalize association fields so the multi-selects bind to arrays of numeric ids
    const marcasSource = product.marcasIds ?? product.marcas ?? [];
    const categoriasSource = product.categoriasIds ?? product.categorias ?? [];
    this.editModel = { ...product };
    this.editModel.marcasIds = this.normalizeIdsField(marcasSource).ids;
    this.editModel.categoriasIds = this.normalizeIdsField(categoriasSource).ids;
    // ensure imagenes is an array we can edit in UI
    this.editModel.imagenes = Array.isArray(this.editModel.imagenes) ? this.editModel.imagenes.map((img:any)=> ({ ...img })) : [];
  }

  cancelEdit() {
    this.editModel = null;
  }

  // --- Image management for edit panel ---
  newImageUrl = '';
  newImageAlt = '';

  startEditImage(img: any) {
    img._editing = true;
    img._backup = { url: img.url, textoAlt: img.textoAlt, orden: img.orden };
  }

  saveImageEdit(img: any) {
    const id = img.idImagen ?? img.id;
    if (!id) {
      this.message = 'ID de imagen no disponible';
      return;
    }
    const payload = { url: img.url, textoAlt: img.textoAlt, orden: img.orden ?? 0 };
    this.http.put(`http://localhost:8080/api/imagenes-producto/${id}`, payload).subscribe({
      next: (res:any) => {
        this.message = 'Imagen actualizada';
        img._editing = false;
        delete img._backup;
        this.loadProducts();
      },
      error: (e:any) => {
        console.error('Error actualizando imagen', e);
        this.message = `Error actualizando imagen: ${e?.error?.mensaje ?? e?.message ?? e}`;
      }
    });
  }

  cancelEditImage(img: any) {
    if (img._backup) {
      img.url = img._backup.url;
      img.textoAlt = img._backup.textoAlt;
      img.orden = img._backup.orden;
    }
    img._editing = false;
    delete img._backup;
  }

  deleteImage(img: any) {
    const id = img.idImagen ?? img.id;
    if (!id) {
      // just remove from local array
      this.editModel.imagenes = (this.editModel.imagenes || []).filter((x:any) => x !== img);
      return;
    }
    if (!confirm('Eliminar imagen?')) return;
    this.http.delete(`http://localhost:8080/api/imagenes-producto/${id}`).subscribe({
      next: () => {
        this.message = 'Imagen eliminada';
        this.editModel.imagenes = (this.editModel.imagenes || []).filter((x:any) => (x.idImagen ?? x.id) !== id);
        this.loadProducts();
      },
      error: (e:any) => {
        console.error('Error eliminando imagen', e);
        this.message = `Error eliminando imagen: ${e?.error?.mensaje ?? e?.message ?? e}`;
      }
    });
  }

  addImageToEditModel() {
    const url = (this.newImageUrl || '').toString().trim();
    if (!url) { this.message = 'Ingresá URL de la imagen'; return; }
    const pid = this.editModel?.idProducto ?? this.editModel?.id;
    const normalized = this.normalizeImageUrl(url);

    // If product has an id on the server, persist immediately via the imagenes endpoint
    if (pid) {
      const payload = { idProducto: pid, url: normalized, textoAlt: (this.newImageAlt || this.editModel?.nombre || '').toString().trim(), orden: 0 };
      this.http.post((environment?.backendBaseUrl || 'http://localhost:8080') + '/api/imagenes-producto', payload).subscribe({
        next: (res:any) => {
          const created = res?.data ?? res ?? null;
          const imgObj = created && (created.idImagen || created.id) ? created : { url: normalized, textoAlt: (this.newImageAlt || this.editModel?.nombre || '').toString().trim() };
          this.editModel.imagenes = this.editModel.imagenes || [];
          this.editModel.imagenes.push(imgObj);
          this.message = 'Imagen agregada';
          this.newImageUrl = '';
          this.newImageAlt = '';
          this.loadProducts();
        },
        error: (e:any) => {
          console.error('Error agregando imagen', e);
          this.message = `Error agregando imagen: ${e?.error?.mensaje ?? e?.message ?? e}`;
        }
      });
      return;
    }

    // If no product id (e.g. local edit before save), add image locally so user can save it later
    this.editModel.imagenes = this.editModel.imagenes || [];
    this.editModel.imagenes.push({ url: normalized, textoAlt: (this.newImageAlt || this.editModel?.nombre || '').toString().trim() });
    this.message = 'Imagen agregada localmente. Guardá el producto para persistirla.';
    this.newImageUrl = '';
    this.newImageAlt = '';
  }

  saveEdit() {
    if (!this.editModel) return;
    const id = this.editModel.idProducto ?? this.editModel.id;
    if (!id) return;
    const payload: any = {
      nombre: (this.editModel.nombre || '').toString().trim(),
      slug: (this.editModel.slug || '').toString().trim() || `producto-${Date.now()}`,
      descripcion: (this.editModel.descripcion || '').toString().trim(),
      activo: !!this.editModel.activo,
      marcasIds: this.normalizeIdsField(this.editModel.marcasIds).ids,
      categoriasIds: this.normalizeIdsField(this.editModel.categoriasIds).ids,
      precio: this.editModel.precio != null ? Number(this.editModel.precio) : null,
      moneda: this.editModel.moneda ? this.editModel.moneda.toString().trim() : null,
      varianteActiva: this.editModel.varianteActiva != null ? !!this.editModel.varianteActiva : null,
      stock: this.editModel.stock != null ? Number(this.editModel.stock) : 0,
      descuento: this.editModel.descuento != null ? Number(this.editModel.descuento) : 0 
    };
    // Include imagenes if present so backends that accept DTO.imagenes can persist them
    if (this.editModel.imagenes && Array.isArray(this.editModel.imagenes) && this.editModel.imagenes.length) {
      // map to minimal image DTOs
      payload.imagenes = this.editModel.imagenes.map((i:any) => ({ url: i.url, textoAlt: i.textoAlt, orden: i.orden }));
      // legacy single-image field
      payload.img = (this.editModel.imagenes[0] && this.editModel.imagenes[0].url) ? this.editModel.imagenes[0].url : payload.img;
    }
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
    // load marcas and categorias for selects
    this.marcaService.getAll().subscribe({
      next: (res: any) => {
        // backend wrapper support
        this.marcasList = Array.isArray(res) ? res : (res?.data ?? res ?? []);
        this.filteredMarcas = this.marcasList.slice();
      },
      error: (err) => console.warn('no se pudieron cargar marcas', err)
    });
    this.categoriaService.getAll().subscribe({
      next: (res: any) => {
        this.categoriasList = Array.isArray(res) ? res : (res?.data ?? res ?? []);
        this.filteredCategorias = this.categoriasList.slice();
      },
      error: (err) => console.warn('no se pudieron cargar categorias', err)
    });
  }

  // --- mini-search helpers ---
  onMarcaFilterChange() {
    if (this.marcaFilterTimer) clearTimeout(this.marcaFilterTimer);
    this.marcaFilterTimer = setTimeout(() => this.applyMarcaFilter(), 300);
  }

  applyMarcaFilter() {
    const q = (this.marcaFilter || '').toString().trim().toLowerCase();
    if (!q) { this.filteredMarcas = this.marcasList.slice(); return; }
    this.filteredMarcas = this.marcasList.filter(m => {
      const nombre = (m.nombre || '').toString().toLowerCase();
      const id = (m.idMarca ?? m.id ?? '').toString();
      return nombre.includes(q) || id.includes(q);
    });
  }

  onCategoriaFilterChange() {
    if (this.categoriaFilterTimer) clearTimeout(this.categoriaFilterTimer);
    this.categoriaFilterTimer = setTimeout(() => this.applyCategoriaFilter(), 300);
  }

  applyCategoriaFilter() {
    const q = (this.categoriaFilter || '').toString().trim().toLowerCase();
    if (!q) { this.filteredCategorias = this.categoriasList.slice(); return; }
    this.filteredCategorias = this.categoriasList.filter(c => {
      const nombre = (c.nombre || '').toString().toLowerCase();
      const id = (c.idCategoria ?? c.id ?? '').toString();
      return nombre.includes(q) || id.includes(q);
    });
  }

  // create marca/categoria inline
  createMarca() {
    const raw = (this.newMarcaName || '').toString().trim();
    if (!raw) return;
    const names = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (!names.length) return;
    this.loading = true;
    (async () => {
      const created: string[] = [];
      try {
        for (const n of names) {
          const res: any = await firstValueFrom(this.marcaService.create({ nombre: n }));
          created.push(n);
        }
        this.message = `Marca(s) creada(s): ${created.join(', ')}`;
        this.newMarcaName = '';
        await this.reloadMarcas();
      } catch (err:any) {
        console.error('createMarca error', err);
        this.message = `Error creando marca: ${err?.error?.mensaje ?? err?.message ?? err}`;
      } finally {
        this.loading = false;
      }
    })();
  }

  createCategoria() {
    const raw = (this.newCategoriaName || '').toString().trim();
    if (!raw) return;
    const names = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (!names.length) return;
    this.loading = true;
    (async () => {
      const created: string[] = [];
      try {
        for (const n of names) {
          const res: any = await firstValueFrom(this.categoriaService.create({ nombre: n }));
          created.push(n);
        }
        this.message = `Categoría(s) creada(s): ${created.join(', ')}`;
        this.newCategoriaName = '';
        await this.reloadCategorias();
      } catch (err:any) {
        console.error('createCategoria error', err);
        this.message = `Error creando categoría: ${err?.error?.mensaje ?? err?.message ?? err}`;
      } finally {
        this.loading = false;
      }
    })();
  }

  // reload helpers
  private reloadMarcas(): Promise<void> {
    return firstValueFrom(this.marcaService.getAll()).then((r:any) => { this.marcasList = Array.isArray(r)? r : (r?.data ?? r ?? []); this.applyMarcaFilter(); }).then(() => {});
  }

  private reloadCategorias(): Promise<void> {
    return firstValueFrom(this.categoriaService.getAll()).then((r:any) => { this.categoriasList = Array.isArray(r)? r : (r?.data ?? r ?? []); this.applyCategoriaFilter(); }).then(() => {});
  }

  // edit / delete marcas
  editMarcaStart(m: any) {
    this.marcaEditingId = m.idMarca ?? m.id ?? null;
    this.marcaEditingName = m.nombre ?? '';
  }

  openManageModal(tab: 'marcas' | 'categorias' = 'marcas') {
    this.showManageEntitiesModal = true;
    // ensure filters applied
    this.applyMarcaFilter();
    this.applyCategoriaFilter();
  }

  closeManageModal() {
    this.showManageEntitiesModal = false;
    // clear edit state
    this.cancelMarcaEdit();
    this.cancelCategoriaEdit();
  }

  cancelMarcaEdit() {
    this.marcaEditingId = null;
    this.marcaEditingName = '';
  }

  saveMarca() {
    if (this.marcaEditingId == null) return;
    const id = this.marcaEditingId;
    const name = (this.marcaEditingName || '').toString().trim();
    if (!name) return;
    this.loading = true;
    this.marcaService.update(id, { nombre: name }).subscribe({ next: () => { this.message = 'Marca actualizada'; this.cancelMarcaEdit(); this.reloadMarcas().finally(()=> this.loading = false); }, error: (e)=> { this.loading = false; console.error('update marca', e); this.message = `Error actualizando marca: ${e?.error?.mensaje ?? e?.message ?? e}`; } });
  }

  deleteMarca(idRaw: any) {
    const id = Number(idRaw);
    if (!id) return;
    if (!confirm('¿Eliminar marca?')) return;
    this.loading = true;
    this.marcaService.delete(id).subscribe({ next: () => { this.message = 'Marca eliminada'; this.reloadMarcas().finally(()=> this.loading = false); }, error: (e)=> { this.loading = false; console.error('delete marca', e); this.message = `Error eliminando marca: ${e?.error?.mensaje ?? e?.message ?? e}`; } });
  }

  // edit / delete categorias
  editCategoriaStart(c: any) {
    this.categoriaEditingId = c.idCategoria ?? c.id ?? null;
    this.categoriaEditingName = c.nombre ?? '';
  }

  cancelCategoriaEdit() {
    this.categoriaEditingId = null;
    this.categoriaEditingName = '';
  }

  saveCategoria() {
    if (this.categoriaEditingId == null) return;
    const id = this.categoriaEditingId;
    const name = (this.categoriaEditingName || '').toString().trim();
    if (!name) return;
    this.loading = true;
    this.categoriaService.update(id, { nombre: name }).subscribe({ next: () => { this.message = 'Categoría actualizada'; this.cancelCategoriaEdit(); this.reloadCategorias().finally(()=> this.loading = false); }, error: (e)=> { this.loading = false; console.error('update categoria', e); this.message = `Error actualizando categoría: ${e?.error?.mensaje ?? e?.message ?? e}`; } });
  }

  deleteCategoria(idRaw: any) {
    const id = Number(idRaw);
    if (!id) return;
    if (!confirm('¿Eliminar categoría?')) return;
    this.loading = true;
    this.categoriaService.delete(id).subscribe({ next: () => { this.message = 'Categoría eliminada'; this.reloadCategorias().finally(()=> this.loading = false); }, error: (e)=> { this.loading = false; console.error('delete categoria', e); this.message = `Error eliminando categoría: ${e?.error?.mensaje ?? e?.message ?? e}`; } });
  }

  // helpers to display names in the product list
  getMarcaNames(p: any): string {
    const sources = p.marcas ?? p.marcasIds ?? [];
    const ids = Array.isArray(sources) ? sources.map((x:any) => typeof x === 'object' ? (x.idMarca ?? x.id) : x) : [];
    const names = ids.map((id:any) => {
      const m = this.marcasList.find(x => (x.idMarca ?? x.id) === id);
      if (m) return m.nombre;
      // maybe the product contains full objects
      const found = (p.marcas || []).find((mm:any) => (mm.idMarca ?? mm.id) === id);
      return found ? found.nombre : String(id);
    });
    return names.filter(Boolean).join(', ');
  }

  getCategoriaNames(p: any): string {
    const sources = p.categorias ?? p.categoriasIds ?? [];
    const ids = Array.isArray(sources) ? sources.map((x:any) => typeof x === 'object' ? (x.idCategoria ?? x.id) : x) : [];
    const names = ids.map((id:any) => {
      const c = this.categoriasList.find(x => (x.idCategoria ?? x.id) === id);
      if (c) return c.nombre;
      const found = (p.categorias || []).find((cc:any) => (cc.idCategoria ?? cc.id) === id);
      return found ? found.nombre : String(id);
    });
    return names.filter(Boolean).join(', ');
  }

  // checkbox helpers for selecting marcas/categorias in create/edit forms
  isMarcaChecked(id: any, editing = false): boolean {
    const arr = editing ? (this.editModel?.marcasIds ?? []) : (this.model?.marcasIds ?? []);
    const num = Number(id);
    return Array.isArray(arr) && arr.map(Number).includes(num);
  }

  toggleMarcaSelection(id: any, checked: boolean, editing = false) {
    const num = Number(id);
    if (editing) {
      if (!this.editModel) this.editModel = {};
      if (!Array.isArray(this.editModel.marcasIds)) this.editModel.marcasIds = [];
      const idx = this.editModel.marcasIds.map(Number).indexOf(num);
      if (checked && idx === -1) this.editModel.marcasIds.push(num);
      if (!checked && idx > -1) this.editModel.marcasIds.splice(idx, 1);
    } else {
      if (!this.model) this.model = {};
      if (!Array.isArray(this.model.marcasIds)) this.model.marcasIds = [];
      const idx = this.model.marcasIds.map(Number).indexOf(num);
      if (checked && idx === -1) this.model.marcasIds.push(num);
      if (!checked && idx > -1) this.model.marcasIds.splice(idx, 1);
    }
  }

  isCategoriaChecked(id: any, editing = false): boolean {
    const arr = editing ? (this.editModel?.categoriasIds ?? []) : (this.model?.categoriasIds ?? []);
    const num = Number(id);
    return Array.isArray(arr) && arr.map(Number).includes(num);
  }

  toggleCategoriaSelection(id: any, checked: boolean, editing = false) {
    const num = Number(id);
    if (editing) {
      if (!this.editModel) this.editModel = {};
      if (!Array.isArray(this.editModel.categoriasIds)) this.editModel.categoriasIds = [];
      const idx = this.editModel.categoriasIds.map(Number).indexOf(num);
      if (checked && idx === -1) this.editModel.categoriasIds.push(num);
      if (!checked && idx > -1) this.editModel.categoriasIds.splice(idx, 1);
    } else {
      if (!this.model) this.model = {};
      if (!Array.isArray(this.model.categoriasIds)) this.model.categoriasIds = [];
      const idx = this.model.categoriasIds.map(Number).indexOf(num);
      if (checked && idx === -1) this.model.categoriasIds.push(num);
      if (!checked && idx > -1) this.model.categoriasIds.splice(idx, 1);
    }
  }

  //carga n8n 
  /**
   * Normalize common image URL shapes (e.g. Google Drive share links) into direct-access URLs.
   */
  normalizeImageUrl(url: string): string {
    if (!url) return url;
    const s = url.toString().trim();
    // drive file share: /file/d/ID/
    const m = s.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
    // drive id param: ?id=ID or &id=ID
    const m2 = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2 && m2[1]) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;
    // open?id=ID
    const m3 = s.match(/open\?id=([a-zA-Z0-9_-]+)/);
    if (m3 && m3[1]) return `https://drive.google.com/uc?export=view&id=${m3[1]}`;
    return s;
  }

  loadingRecarga = false;
  recargaMsg = '';

  dispararRecargaN8n() {
    this.loadingRecarga = true;
    this.recargaMsg = '';
    this.http.post(environment1.N8N_RELOAD_URL, {})
      .subscribe({
        next: (res: any) => {
          console.log('n8n OK', res);
          // Top-level message
          const topMsg = res?.mensaje ?? res?.message ?? 'Recarga iniciada';

          // If backend returns an array of results inside `data`, collect any inner errors
          const inner = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          const problems: string[] = [];

          for (const item of inner) {
            if (!item) continue;
            // item may be a wrapper with mensaje/codigo
            const code = item?.codigo ?? item?.status ?? null;
            const msg = item?.mensaje ?? item?.message ?? JSON.stringify(item);
            // consider codes >= 400 as problems (also include any non-200/201/204 codes)
            if (code && Number(code) >= 400) problems.push(`${msg} (código ${code})`);
            // sometimes code 207 (partial) should still report sub-errors
            if (!code && item?.mensaje) problems.push(msg);
          }

          if (problems.length) {
            this.recargaMsg = `${topMsg}. Errores: ${problems.join(' ; ')}. Usá 'Recargar lista' para actualizar la tabla.`;
          } else {
            this.recargaMsg = `${topMsg}. Éxito. Usá 'Recargar lista' para actualizar la tabla.`;
          }

          // stop loading immediately. Manual reload only (user will click 'Recargar lista')
          this.loadingRecarga = false;
        },
        error: (err: any) => {
          console.error('error n8n', err);
          // Try to surface useful info from error body
          const body = err?.error ?? err;
          let serverMsg = '';
          try {
            serverMsg = body?.mensaje ?? body?.message ?? (typeof body === 'string' ? body : JSON.stringify(body));
          } catch (e) {
            serverMsg = String(body);
          }
          this.recargaMsg = `No se pudo disparar la recarga de productos: ${serverMsg}`;
          this.loadingRecarga = false;
        }
      });
  }
}
