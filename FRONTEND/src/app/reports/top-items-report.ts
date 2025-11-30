import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ReportsService, TopItemDto } from '../services/reports.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-top-items-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './top-items-report.html',
  styleUrls: ['./top-items-report.css']
})
export class TopItemsReport implements OnInit {
  private reports = inject(ReportsService);
  private router = inject(Router);

  from: string = this.defaultFrom();
  to: string = this.defaultTo();
  limit = 10;

  loading = false;
  error = '';
  items: TopItemDto[] = [];

  ngOnInit(): void {
    this.load();
  }

  defaultTo(): string {
    const d = new Date();
    return d.toISOString().slice(0,10);
  }

  defaultFrom(): string {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0,10);
  }

  load() {
    this.error = '';
    this.loading = true;
    this.reports.getTopItems(this.from, this.to, this.limit).subscribe({
      next: (res: any) => {
        const data = (res?.data ?? res ?? []);
        this.items = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err: any) => {
        try {
          const status = err?.status;
          const url = err?.url ?? '';
          if (status === 404) {
            this.error = `Endpoint no encontrado (404): ${url}`;
          } else if (err?.error?.mensaje) {
            this.error = err.error.mensaje;
          } else {
            this.error = err?.message ?? JSON.stringify(err);
          }
        } catch {
          this.error = 'Error al cargar datos';
        }
        this.items = [];
        this.loading = false;
      }
    });
  }

  goToProduct(id: any) {
    if (!id) return;
    try {
      this.router.navigate(['/productos', id]);
    } catch (e) {
      // fallback: change location if router fails
      try { window.location.href = `/productos/${id}`; } catch {}
    }
  }

  productIdOf(it: TopItemDto) {
    return it['idProducto'] ?? it['productoId'] ?? it['id'];
  }

  titleOf(it: TopItemDto) {
    return it.nombre
      ?? it.titulo
      ?? it['nombreProducto']
      ?? it['title']
      ?? 'Item';
  }

  qtyOf(it: TopItemDto) {
    const maybe =
      it.cantidadVendida ??
      it['cantidad'] ??
      it['qty'] ??
      it['totalCantidad'] ??
      0;

    return Math.round(this.parseNumber(maybe));
  }

  totalOf(it: TopItemDto) {
    const maybe =
      it.totalVenta ??
      it['total'] ??
      it['ventaTotal'] ??
      it['totalRevenue'] ??
      it['totalRevenueDouble'] ??
      0;

    return this.parseNumber(maybe);
  }

  imageOf(it: TopItemDto) {
    const direct =
      it.imagenUrl ??
      it['imagen'] ??
      it['imageUrl'] ??
      it['image'] ??
      '';

    if (direct) return direct;

    const id = this.productIdOf(it);

    if (id) {
      return `${environment.backendBaseUrl}/api/productos/${id}/imagen`;
    }

    return '';
  }

  private parseNumber(v: any): number {
    if (v == null) return 0;
    if (typeof v === 'number' && isFinite(v)) return v;

    try {
      const s = String(v).trim();
      const cleaned = s.replace(/[^0-9.,\-]/g, '');

      if (!cleaned.includes('.') && cleaned.includes(',')) {
        const parts = cleaned.split(',');
        const last = parts.pop();
        const head = parts.join('');
        return Number(head + '.' + last) || 0;
      }

      return Number(cleaned.replace(/,/g, '')) || 0;
    } catch {
      return 0;
    }
  }
}
