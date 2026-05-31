import { Injectable, signal, computed } from '@angular/core';
import { OngResumo } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class OngContextService {
  private readonly STORAGE_KEY = 'conectapet_selected_ong';

  private _selectedOng = signal<OngResumo | null>(this.loadFromStorage());

  readonly selectedOng   = this._selectedOng.asReadonly();
  readonly selectedOngId = computed(() => this._selectedOng()?.id ?? null);
  readonly hasOng        = computed(() => this._selectedOng() !== null);
  readonly isOngAdmin    = computed(() => this._selectedOng()?.myRole === 'ONG_ADMIN');

  selectOng(ong: OngResumo): void {
    this._selectedOng.set(ong);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ong));
  }

  clearOng(): void {
    this._selectedOng.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): OngResumo | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
