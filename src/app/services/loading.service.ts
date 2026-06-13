import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * [UI] Servicio de estado de carga global. Lleva un contador de peticiones HTTP
 * activas y expone `loading$` (true mientras haya al menos una en curso). El
 * `LoadingInterceptor` lo alimenta automáticamente.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$: Observable<boolean> = this._loading$.asObservable();

  show(): void {
    this.count++;
    if (this.count === 1) {
      this._loading$.next(true);
    }
  }

  hide(): void {
    if (this.count > 0) {
      this.count--;
    }
    if (this.count === 0) {
      this._loading$.next(false);
    }
  }
}
