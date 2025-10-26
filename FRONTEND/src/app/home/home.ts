import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LOCALE_ID } from '@angular/core';
import esAR from '@angular/common/locales/es-AR';

registerLocaleData(esAR);

type Category = { id:number; name:string; icon?:string };
type Product  = { id:number; name:string; price:number; img:string; badge?:string; categoryId:number };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'es-AR' }],
})
export class Home {
  q = '';
  activeCategory: number | 'all' = 'all';
  onlyOffers = false;
  currentYear = new Date().getFullYear();

  categories: Category[] = [
    { id: 1, name: 'Inyección' },
    { id: 2, name: 'Turbos' },
    { id: 3, name: 'Filtros' },
    { id: 4, name: 'Baterías' },
    { id: 5, name: 'Seguridad' },
  ];

  products: Product[] = [
    { id:101, name:'Bomba inyectora Bosch CP3', price:420000, img:'assets/img/prod/cp3.jpg', badge:'OFERTA', categoryId:1 },
    { id:102, name:'Inyector Delphi EJBR03101D', price:195000, img:'assets/img/prod/delphi.jpg', categoryId:1 },
    { id:201, name:'Turbo Garrett GT1749V', price:680000, img:'assets/img/prod/gt1749v.jpg', badge:'NUEVO', categoryId:2 },
    { id:202, name:'Kit reparación turbo T25',  price:130000, img:'assets/img/prod/t25kit.jpg', categoryId:2 },
  ];

  get filteredProducts(): Product[] {
    const t = this.q.trim().toLowerCase();
    return this.products.filter(p =>
      (this.activeCategory === 'all' || p.categoryId === this.activeCategory) &&
      (!t || p.name.toLowerCase().includes(t)) &&
      (!this.onlyOffers || p.badge === 'OFERTA')
    );
  }

  setCategory(cat: number | 'all') { this.activeCategory = cat; }
  toggleOffers() { this.onlyOffers = !this.onlyOffers; }
  addToCart(p: Product) { console.log('addToCart', p.id); }

  // helper used by the template to avoid complex expressions in the template
  hasNovedades(): boolean {
    return Array.isArray(this.products) && this.products.some(p => p.badge === 'NUEVO');
  }
}
