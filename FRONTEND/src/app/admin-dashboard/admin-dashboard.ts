import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReportsService } from '../services/reports.service';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  private reports = inject(ReportsService);
  private router = inject(Router);

  loadingTop = false;
  topItems: any[] = [];
  topError = '';
  
  // numeric helpers
  private parseNumber(v: any): number {
    if (v == null) return 0;
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    try {
      const s = String(v).trim();
      const cleaned = s.replace(/[^0-9.,\-]/g, '');
      if (cleaned.indexOf('.') === -1 && cleaned.indexOf(',') !== -1) {
        const parts = cleaned.split(',');
        const last = parts.pop();
        const head = parts.join('');
        const normalized = head + '.' + last;
        const n = Number(normalized);
        return isNaN(n) ? 0 : n;
      }
      const normalized2 = cleaned.replace(/,/g, '');
      const n2 = Number(normalized2);
      return isNaN(n2) ? 0 : n2;
    } catch { return 0; }
  }

  totalOf(it: any): number {
    const maybe = it.totalVenta ?? it['total'] ?? it['ventaTotal'] ?? it['subtotal'] ?? 0;
    return this.parseNumber(maybe);
  }
  ngOnInit(): void {
    this.loadTopItems();
  }

  private defaultTo(): string {
    const d = new Date();
    return d.toISOString().slice(0,10);
  }

  private defaultFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0,10);
  }

  loadTopItems(limit = 3) {
    this.loadingTop = true;
    const from = this.defaultFrom();
    const to = this.defaultTo();
    this.reports.getTopItems(from, to, limit).subscribe({
      next: (res: any) => {
        const data = (res?.data ?? res ?? []);
        this.topItems = Array.isArray(data) ? data : [];
        this.loadingTop = false;
        this.topError = '';
      },
      error: (err: any) => {
        this.topItems = [];
        this.loadingTop = false;
        try {
          const status = err?.status;
          const url = err?.url ?? '';
          if (status === 404) this.topError = `Endpoint /api/reports/top-items no encontrado (404). Revisá que el backend esté corriendo y el controller esté registrado.`;
          else this.topError = err?.error?.mensaje ?? err?.message ?? JSON.stringify(err);
        } catch {
          this.topError = 'Error al cargar top items';
        }
      }
    });
  }

  goToProduct(id: any) {
    if (!id) return;
    try { this.router.navigate(['/productos', id]); } catch { try { window.location.href = `/productos/${id}`; } catch {} }
  }
}
