import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteVentaProductoComponent } from './reporte-venta-producto.component';

describe('ReporteVentaProductoComponent', () => {
  let component: ReporteVentaProductoComponent;
  let fixture: ComponentFixture<ReporteVentaProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteVentaProductoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteVentaProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
