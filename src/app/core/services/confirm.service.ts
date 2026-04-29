import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  open(title: string, message: string, confirmLabel = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({ title, message, confirmLabel, resolve });
    });
  }

  accept(): void {
    this.state()?.resolve(true);
    this.state.set(null);
  }

  cancel(): void {
    this.state()?.resolve(false);
    this.state.set(null);
  }
}
