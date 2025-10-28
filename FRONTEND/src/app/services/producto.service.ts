import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
 
  private base = 'http://localhost:8080/api/productos';

  getAll(): Observable<any> {
    return this.http.get(this.base);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  create(dto: any): Observable<any> {
    return this.http.post(this.base, dto);
  }

  update(id: number, dto: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
