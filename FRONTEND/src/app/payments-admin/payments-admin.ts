import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoService } from '../services/pago.service';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payments-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payments-admin.html',
  styleUrls: ['./payments-admin.css']
})
export class PaymentsAdmin implements OnInit {
  private pagoService = inject(PagoService);
  private http = inject(HttpClient);

  payments: any[] = [];
  loading = false;
  message = '';
  filter = '';
  selected: any = null;

  // sorting / filtering
  statusFilter: string = '';
  sortField: 'date' | 'amount' | 'status' = 'date';
  sortDir: 'asc' | 'desc' = 'desc';

  // importante: pública para usar en el template
  originalPayments: any[] = [];

  // chart
  private chart: any = null;

  // --- getters para resumen ---
  get totalPayments(): number {
    return this.originalPayments.length;
  }

  get filteredPayments(): number {
    return this.payments.length;
  }

  get totalAmount(): number {
    return this.originalPayments.reduce((s, p) => s + Number(p.amount ?? 0), 0);
  }

  get filteredAmount(): number {
    return this.payments.reduce((s, p) => s + Number(p.amount ?? 0), 0);
  }

  ngOnInit(): void {
    // Load Chart.js first then payments (chart will update after payments load)
    this.loadChartScript()
      .then(() => this.loadPayments())
      .catch(() => this.loadPayments());
  }

  loadPayments() {
    this.loading = true;
    this.message = '';
    this.pagoService.getAll().subscribe({
      next: (res: any) => {
        this.loading = false;
        // backend puede envolver en data o devolver array directo
        if (Array.isArray(res)) this.payments = res;
        else if (res?.data && Array.isArray(res.data)) this.payments = res.data;
        else if (res?.data?.content && Array.isArray(res.data.content)) this.payments = res.data.content;
        else this.payments = res?.data ?? res ?? [];

        this.originalPayments = (this.payments || []).slice();
        // filtros / orden por defecto
        this.applyFilter();
        this.updateChart();
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Error loading payments', err);
        this.message = `No se pudieron cargar los pagos: ${err?.message ?? err}`;
      }
    });
  }

  private loadChartScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof (window as any).Chart !== 'undefined') return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = () => resolve();
      s.onerror = () => reject();
      document.head.appendChild(s);
    });
  }

  private updateChart() {
    try {
      if (!this.payments || !this.payments.length) {
        if (this.chart) {
          this.chart.destroy();
          this.chart = null;
        }
        return;
      }
      // agrupar por fecha (dateCreated / date_created / dateApproved)
      const counts: Record<string, number> = {};
      for (const p of this.payments) {
        const d = p.dateCreated ?? p.date_created ?? p.dateApproved ?? p.dateApprovedAt ?? null;
        let day = 'sin-fecha';
        if (d) {
          const dt = new Date(d);
          if (!isNaN(dt.getTime())) {
            day = dt.toISOString().slice(0, 10);
          }
        }
        counts[day] = (counts[day] || 0) + 1;
      }
      const labels = Object.keys(counts).sort();
      const data = labels.map(l => counts[l]);

      const ctx = (document.getElementById('paymentsChart') as HTMLCanvasElement | null)?.getContext('2d');
      if (!ctx) return;
      if (this.chart) this.chart.destroy();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.chart = new (window as any).Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Pagos por día', data, backgroundColor: '#4CAF50' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    } catch (e) {
      console.warn('No se pudo renderizar chart', e);
    }
  }

  applyFilter() {
    const q = (this.filter || '').toString().trim().toLowerCase();
    // arrancar siempre desde originalPayments
    let list = (this.originalPayments || []).slice();

    if (this.statusFilter) {
      const sf = this.statusFilter.toString().toLowerCase();
      list = list.filter((p: any) => ((p.status || '').toString().toLowerCase() || '').includes(sf));
    }

    if (q) {
      list = list.filter(p => {
        return String(
          p.orderId ??
          p.order_id ??
          p.order ??
          p.preferenceId ??
          p.paymentId ??
          p.status ??
          p.payerEmail ??
          p.paymentMethod ??
          p.amount
        )
          .toLowerCase()
          .includes(q);
      });
    }

    // ordenar
    list.sort((a: any, b: any) => this.sortCompare(a, b));

    this.payments = list;
    this.updateChart();
  }

  private sortCompare(a: any, b: any) {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (this.sortField === 'amount') {
      const av = Number(a.amount ?? 0);
      const bv = Number(b.amount ?? 0);
      return (av - bv) * dir;
    }
    if (this.sortField === 'status') {
      const sa = String(a.status || '').toLowerCase();
      const sb = String(b.status || '').toLowerCase();
      if (sa === sb) return 0;
      return sa > sb ? dir : -dir;
    }
    // default date
    const da = new Date(a.dateCreated ?? a.date_created ?? a.dateApproved ?? a.dateApprovedAt ?? null).getTime() || 0;
    const db = new Date(b.dateCreated ?? b.date_created ?? b.dateApproved ?? b.dateApprovedAt ?? null).getTime() || 0;
    return (da - db) * dir;
  }

  select(p: any) {
    this.selected = p;
    // clear previously fetched items
    if (this.selected) {
      this.selected._fetchedItems = this.selected._fetchedItems ?? null;
      // Try to fetch items from backend using pago id or order id
      const pagoId = this.selected.id ?? this.selected.pagoId ?? this.selected.paymentDbId ?? null;
      if (pagoId) {
        this.pagoService.getItemsByPagoId(pagoId).subscribe({
          next: (res:any) => {
              // backend wraps in BaseResponse: { message, status, data }
              const items = res?.data ?? res ?? [];
              // keep raw copy for debugging
              this.selected._rawFetchedItems = items;
              // Normalize DTOs to our internal shape; compute unit price if needed
              this.selected._fetchedItems = (items || []).map((it:any) => this.normalizeFetchedItem(it));
          },
          error: () => {
            // ignore and fallback to orderId path
            this.fetchByOrderIdIfPossible(p);
          }
        });
      } else {
        this.fetchByOrderIdIfPossible(p);
      }
    }
  }

  private fetchByOrderIdIfPossible(p: any) {
    const orderIdRaw = p.orderId ?? p.order_id ?? p.order ?? null;
    if (!orderIdRaw) return;
    // If orderId is numeric string try to call by id
    const orderIdNum = Number(orderIdRaw);
    if (!isNaN(orderIdNum) && orderIdNum > 0) {
      this.pagoService.getItemsByOrderId(orderIdNum).subscribe({
        next: (res:any) => {
          const items = res?.data ?? res ?? [];
          this.selected._rawFetchedItems = items;
          this.selected._fetchedItems = (items || []).map((it:any) => this.normalizeFetchedItem(it));
        },
        error: (err:any) => {
          console.debug('No se pudieron obtener items por orderId', err);
        }
      });
    }
  }

  closeDetail() {
    this.selected = null;
  }

  // normalizar status
  getStatus(p: any): string {
    if (!p) return '';
    const s = p.status ?? p.estado ?? p.payment_status ?? p.paymentStatus ?? p.statusDetail ?? '';
    return (s || '').toString();
  }

  // normalizar método de pago
  getMethod(p: any): string {
    if (!p) return '';
    return (p.paymentMethod ?? p.payment_method ?? p.payment_method_id ?? p.method ?? p.metodo ?? '').toString();
  }

  // fecha amigable
  formatDate(p: any): string {
    const d = p.dateCreated ?? p.date_created ?? p.dateApproved ?? p.dateApprovedAt ?? p.createdAt ?? null;
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString();
  }

  // Extract items from payment/order structures (flexible to different backend shapes)
  getItems(p: any): Array<{name:string, qty:number, price:number}> {
    if (!p) return [];
    // prefer items fetched from backend endpoint
    if (p._fetchedItems && Array.isArray(p._fetchedItems)) return p._fetchedItems;
    let candidates: any = p.items ?? p.orderItems ?? p.order?.items ?? p.pedido?.items ?? p.itemsPurchased ?? p.preference?.items ?? p.cart ?? p.carrito ?? p.lines ?? p.payment_items ?? p.additional_info?.items ?? p.rawNotificationJson?.data?.items ?? p.rawNotificationJson?.data?.resource?.items ?? null;
    // If not found, try to locate an items-like array anywhere inside the object
    if (!candidates) {
      const found = this.findItemsArrayRecursive(p);
      if (found) candidates = found;
    }
    if (!candidates) return [];
    // If there is an items property inside a nested order object
    if (!Array.isArray(candidates) && typeof candidates === 'object') {
      // If it's an object with numeric keys or ids -> convert to array
      const asArray = Object.keys(candidates).map(k => candidates[k]);
      candidates = asArray;
    }
    if (!Array.isArray(candidates)) return [];
    return candidates.map(it => {
      const name = it.title ?? it.name ?? it.descripcion ?? it.productName ?? it.product ?? it.sku ?? it.id ?? '';
      const qty = Number(it.quantity ?? it.cantidad ?? it.qty ?? it.q ?? it.qtyOrdered ?? 1) || 1;
      const price = Number(it.price ?? it.unit_price ?? it.unitPrice ?? it.amount ?? it.subtotal ?? it.total ?? 0) || 0;
      return { name: String(name), qty, price };
    });
  }

  // Recursively search an object for an array that looks like items (objects with quantity/name/price)
  private findItemsArrayRecursive(obj: any, depth = 0): any[] | null {
    if (!obj || depth > 6) return null;
    if (Array.isArray(obj)) {
      // check if array elements look like item objects
      const looksLikeItem = obj.length > 0 && obj.every(el => el && typeof el === 'object' && (
        ('quantity' in el) || ('cantidad' in el) || ('qty' in el) || ('price' in el) || ('unit_price' in el) || ('title' in el) || ('name' in el)
      ));
      if (looksLikeItem) return obj;
      // else try elements
      for (const el of obj) {
        const res = this.findItemsArrayRecursive(el, depth + 1);
        if (res) return res;
      }
      return null;
    }
    if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        try {
          const val = obj[k];
          const res = this.findItemsArrayRecursive(val, depth + 1);
          if (res) return res;
        } catch {
          // ignore
        }
      }
    }
    return null;
  }

  // Normalize a single fetched item into {name, qty, price, subtotal}
  private normalizeFetchedItem(it: any) {
    const name = it?.productoNombre ?? it?.productName ?? it?.name ?? it?.title ?? it?.descripcion ?? it?.producto ?? it?.sku ?? '';
    const qty = Number(this.parseNumber(it?.cantidad ?? it?.quantity ?? it?.qty ?? it?.qtyOrdered ?? it?.cantidad ?? 1)) || 1;
    const subtotalVal = Number(this.parseNumber(it?.subtotal ?? it?.subtotalAmount ?? it?.total ?? it?.subtotal ?? it?.subtotalValue ?? 0)) || 0;
    let unitVal = Number(this.parseNumber(it?.precioUnitario ?? it?.precio ?? it?.price ?? it?.unit_price ?? it?.unitPrice ?? it?.precio_unitario ?? 0)) || 0;

    // sometimes the product object contains price
    if ((!unitVal || unitVal === 0) && it?.producto && typeof it.producto === 'object') {
      unitVal = Number(this.parseNumber(it.producto?.precioUnitario ?? it.producto?.precio ?? it.producto?.price ?? 0)) || unitVal;
    }

    const unitPrice = unitVal || (subtotalVal && qty ? subtotalVal / qty : 0);
    return { name: String(name), qty, price: unitPrice, subtotal: subtotalVal };
  }

  // Try to parse numeric values from different shapes: number, numeric string, BigDecimal-like object, nested value
  private parseNumber(v: any): number {
    if (v == null) return NaN;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v.replace(/[^0-9\.-]/g, ''));
      return isNaN(n) ? NaN : n;
    }
    if (typeof v === 'object') {
      // common BigDecimal serialization as {scale, unscaledValue} or {value}
      if ('value' in v && (typeof v.value === 'number' || typeof v.value === 'string')) return this.parseNumber(v.value as any);
      if ('doubleValue' in v) return this.parseNumber(v.doubleValue);
      if ('intValue' in v) return this.parseNumber(v.intValue);
      if ('unscaledValue' in v && 'scale' in v) {
        try {
          // attempt to compute number from unscaledValue/scale
          const unscaled = Number(String(v.unscaledValue));
          const scale = Number(v.scale) || 0;
          if (!isNaN(unscaled)) return unscaled / Math.pow(10, scale);
        } catch {}
      }
      // try toString
      if (typeof v.toString === 'function') {
        const s = v.toString();
        const n = Number(s.replace(/[^0-9\.-]/g, ''));
        return isNaN(n) ? NaN : n;
      }
    }
    return NaN;
  }

  itemsSummary(p: any): string {
    const items = this.getItems(p);
    if (!items || !items.length) return '-';
    return items.map(i => `${i.qty}x ${i.name || 'item'}${i.price ? ` ($${Number(i.price).toFixed(2)})` : ''}`).join(', ');
  }

  // Normalize payment amount with fallbacks and item-sum fallback
  getPaymentAmount(p: any): number {
    if (!p) return 0;
    const candidates = [
      p.amount,
      p.total,
      p.monto,
      p.paymentAmount,
      p.subtotal,
      p.totalAmount,
      p.montoTotal,
      p.payment?.amount,
      p.rawNotificationJson?.data?.amount
    ];
    for (const c of candidates) {
      const n = Number(c ?? NaN);
      if (!isNaN(n) && n !== 0) return n;
    }
    // last resort: sum fetched items subtotal or unitPrice * qty
    try {
      const items = this.getItems(p) || [];
      const sum = items.reduce((s, it) => s + (Number(it.price ?? 0) * Number(it.qty ?? 1)), 0);
      return sum || 0;
    } catch {
      return 0;
    }
  }
}
