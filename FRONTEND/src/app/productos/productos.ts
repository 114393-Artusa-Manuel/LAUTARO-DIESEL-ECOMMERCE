
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {
  private productoService = inject(ProductoService);

  products: any[] = [];
  loading = false;
  message = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productoService.getAll().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (Array.isArray(res)) this.products = res;
        else if (res?.data && Array.isArray(res.data)) this.products = res.data;
        else if (res?.data?.content && Array.isArray(res.data.content)) this.products = res.data.content;
        else this.products = res?.data ?? res ?? [];
      },
      error: (err: any) => {
        this.loading = false;
        console.error('Failed to load products', err);
        this.message = 'No se pudieron cargar los productos';
      }
    });
  }
}
