import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ToastService {

  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'success', duration = 3500): void {
    const id = Math.random().toString(36).slice(2);
    this.toasts.update((t: any) => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string):   void { this.show(message, 'error');   }
  info(message: string):    void { this.show(message, 'info');    }

  remove(id: string): void {
    this.toasts.update((t: any) => t.filter((x: any) => x.id !== id));
  }

  /** Extract error message from HttpErrorResponse */
  handleError(err: any, fallback = 'Ocorreu um erro. Tente novamente.'): void {
    const msg = err?.error?.message || err?.error?.error || fallback;
    this.error(msg);
  }
}
