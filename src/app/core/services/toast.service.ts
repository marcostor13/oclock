import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 4000): void { this.push('success', message, duration); }
  error(message: string, duration = 6000): void { this.push('error', message, duration); }
  info(message: string, duration = 4000): void { this.push('info', message, duration); }
  warning(message: string, duration = 5000): void { this.push('warning', message, duration); }

  dismiss(id: number): void {
    this.toasts.update((ts) => ts.filter((t) => t.id !== id));
  }

  private push(type: ToastType, message: string, duration: number): void {
    const id = ++this.nextId;
    this.toasts.update((ts) => [...ts, { id, type, message }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
