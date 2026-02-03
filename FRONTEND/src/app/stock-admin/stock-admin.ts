import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../services/stock.service';
import { finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-stock-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-admin.html',
  styleUrls: ['./stock-admin.css']
})
export class StockAdmin implements OnInit {
  private stockService = inject(StockService);

  // ✅ flags separados (no se pisan)
  loadingStock = false;
  creatingOrder = false;

  message = '';

  threshold = 2;
  targetStock = 10;

  lowStock: any[] = [];
  selected: any[] = [];

  get totalLow(): number { return this.lowStock.length; }
  get totalSelected(): number { return this.selected.length; }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loadingStock = true;
    this.message = '';

    this.stockService.getLowStock(this.threshold, this.targetStock)
      .pipe(finalize(() => this.loadingStock = false))
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res ?? [];
          this.lowStock = Array.isArray(data) ? data : [];

          // precargar selección sugerida
          this.selected = this.lowStock
            .filter(x => (x.sugeridoReponer ?? 0) > 0)
            .map(x => ({
              productoId: x.productoId,
              nombre: x.nombre,
              stockActual: x.stockActual,
              cantidad: x.sugeridoReponer
            }));
        },
        error: (err: any) => {
          console.error('Error load stock', err);
          const msg = err?.error?.mensaje || err?.message || 'Error desconocido';
          this.message = `No se pudo cargar stock: ${msg}`;
        }
      });
  }

  toggleSelect(p: any) {
    const idx = this.selected.findIndex(x => x.productoId === p.productoId);
    if (idx >= 0) this.selected.splice(idx, 1);
    else {
      this.selected.push({
        productoId: p.productoId,
        nombre: p.nombre ?? '(sin nombre)',
        stockActual: p.stockActual ?? 0,
        cantidad: p.sugeridoReponer ?? 1
      });
    }
  }

  isSelected(p: any): boolean {
    return this.selected.some(x => x.productoId === p.productoId);
  }

  setQty(productoId: number, qty: any) {
    const n = Number(qty);
    const item = this.selected.find(x => x.productoId === productoId);
    if (!item) return;
    item.cantidad = (!isNaN(n) && n > 0) ? n : 1;
  }

  createOrder() {
    if (!this.selected.length) {
      this.message = 'Seleccioná al menos un producto para encargar.';
      return;
    }

    const payload = {
      proveedorId: null,
      items: this.selected.map(x => ({
        productoId: x.productoId,
        cantidad: x.cantidad
      }))
    };

    this.creatingOrder = true;
    this.message = '';

    this.stockService.createReplenishment(payload)
      .pipe(
        timeout(15000),
        finalize(() => this.creatingOrder = false)
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res;

          // ✅ mostrar confirmación
          this.message = `✅ Solicitud creada (#${data?.solicitudId ?? '-'}) con ${data?.totalItems ?? this.selected.length} ítems.`;

          // ✅ opcional: limpiar selección
          // this.selected = [];

          // ✅ refrescar listado
          this.load();
        },
        error: (err: any) => {
          console.error('Error create replenishment', err);
          const msg = err?.error?.mensaje || err?.error?.message || err?.message || 'Error desconocido';
          this.message = `❌ No se pudo crear la solicitud: ${msg}`;
        }
      });
  }
}
