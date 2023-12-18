import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBodegaComponent } from './modal-bodega.component';

describe('ModalBodegaComponent', () => {
  let component: ModalBodegaComponent;
  let fixture: ComponentFixture<ModalBodegaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalBodegaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalBodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
