import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BajaComprobantesComponent } from './baja-comprobantes.component';

describe('BajaComprobantesComponent', () => {
  let component: BajaComprobantesComponent;
  let fixture: ComponentFixture<BajaComprobantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BajaComprobantesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BajaComprobantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
