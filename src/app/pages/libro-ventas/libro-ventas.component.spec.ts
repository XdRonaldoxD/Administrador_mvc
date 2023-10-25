import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibroVentasComponent } from './libro-ventas.component';

describe('LibroVentasComponent', () => {
  let component: LibroVentasComponent;
  let fixture: ComponentFixture<LibroVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibroVentasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibroVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
