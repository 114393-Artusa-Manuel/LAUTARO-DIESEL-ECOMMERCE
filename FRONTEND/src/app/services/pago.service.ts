import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private baseUrl = `${environment.backendBaseUrl}/api/payments`;
  private baseUrlPagos = `${environment.backendBaseUrl}/api/pagos`;

  constructor(private http: HttpClient) {}

  crearPreferencia(req: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/preference`, req);
  }

  getStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/status/${orderId}`);
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrlPagos}`);
  }

  
  getItemsByPagoId(pagoId: number | string): Observable<any> {
    return this.http.get(`${this.baseUrlPagos}/${pagoId}/items`);
  }

 
  getItemsByOrderId(orderId: number | string): Observable<any> {
    return this.http.get(`${this.baseUrlPagos}/order/${orderId}/items`);
  }
}
