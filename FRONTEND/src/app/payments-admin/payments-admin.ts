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
}
