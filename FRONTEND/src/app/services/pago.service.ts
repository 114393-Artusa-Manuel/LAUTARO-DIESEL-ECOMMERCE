import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private baseUrl = `${environment.backendBaseUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  crearPreferencia(req: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/preference`, req);
  }

  getStatus(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/status/${orderId}`);
  }
}
