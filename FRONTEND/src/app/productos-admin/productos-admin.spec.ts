import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosAdmin } from './productos-admin';

describe('ProductosAdmin', () => {
  let component: ProductosAdmin;
  let fixture: ComponentFixture<ProductosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
