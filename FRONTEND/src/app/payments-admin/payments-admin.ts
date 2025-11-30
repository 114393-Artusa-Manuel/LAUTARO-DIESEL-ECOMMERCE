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
  styleUrls: []
})
export class PaymentsAdmin implements OnInit {
  private pagoService = inject(PagoService);
  private http = inject(HttpClient);

  payments: any[] = [];
  loading = false;
  message = '';
  filter = '';
  selected: any = null;

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments() {
    this.loading = true;
    this.message = '';
    this.pagoService.getAll().subscribe({
      next: (res:any) => {
        this.loading = false;
        // backend may wrap in data or return array directly
        if (Array.isArray(res)) this.payments = res;
        else if (res?.data && Array.isArray(res.data)) this.payments = res.data;
        else if (res?.data?.content && Array.isArray(res.data.content)) this.payments = res.data.content;
        else this.payments = res?.data ?? res ?? [];
      },
      error: (err:any) => {
        this.loading = false;
        console.error('Error loading payments', err);
        this.message = `No se pudieron cargar los pagos: ${err?.message ?? err}`;
      }
    });
  }

  applyFilter() {
    const q = (this.filter || '').toString().trim().toLowerCase();
    if (!q) return this.loadPayments();
    this.payments = (this.payments || []).filter(p => {
      return String(p.orderId || p.order_id || p.order || p.preferenceId || p.paymentId || p.status || p.payerEmail || p.paymentMethod || p.amount)
        .toLowerCase().includes(q);
    });
  }

  select(p:any) {
    this.selected = p;
  }

  closeDetail() { this.selected = null; }
}
