import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMarcaComponent } from './modal-marca.component';

describe('ModalMarcaComponent', () => {
  let component: ModalMarcaComponent;
  let fixture: ComponentFixture<ModalMarcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalMarcaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMarcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
