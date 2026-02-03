import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
private baseUrl = 'http://localhost:8080/api/admin/stock';

  getLowStock(threshold = 2, targetStock = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/low?threshold=${threshold}&targetStock=${targetStock}`);
  }

  createReplenishment(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/replenishments`, payload);
  }
}
