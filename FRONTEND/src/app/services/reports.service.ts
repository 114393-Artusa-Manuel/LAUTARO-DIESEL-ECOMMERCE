import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment2 } from '../../environments/environment';

export interface TopItemDto {
  id?: number | string;
  nombre?: string;
  titulo?: string;
  imagenUrl?: string;
  cantidadVendida?: number;
  totalVenta?: number; // monto total
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private http = inject(HttpClient);
  private base = `${environment2.Url}/api/reports`;

  getTopItems(from: string, to: string, limit = 10): Observable<any> {
    let params = new HttpParams().set('from', from).set('to', to).set('limit', String(limit));
    return this.http.get(`${this.base}/top-items`, { params });
  }
}
