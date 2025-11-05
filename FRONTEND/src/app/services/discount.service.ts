import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private baseUrl = 'http://localhost:8080/api/descuentos';

  constructor(private http: HttpClient) {}

  getActiveDiscounts(userId: number) {
    return this.http.get(`${this.baseUrl}/aplicables/${userId}`);
  }
}
