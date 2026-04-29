import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2.5 pointer-events-none"
      aria-live="assertive"
      aria-atomic="false"
    >
      @for (toast of svc.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-modal min-w-72 max-w-sm"
          [class]="bgClass(toast.type)"
          role="alert"
        >
          <span class="material-symbols-outlined text-[20px] shrink-0 fill" aria-hidden="true">
            {{ iconName(toast.type) }}
          </span>
          <p class="font-body text-body-sm flex-1 leading-snug">{{ toast.message }}</p>
          <button
            type="button"
            (click)="svc.dismiss(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity -mr-1"
            aria-label="Dismiss"
          >
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected readonly svc = inject(ToastService);

  protected bgClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-success-container text-on-success-container',
      error: 'bg-error-container text-on-error-container',
      info: 'bg-primary-fixed text-on-primary-fixed',
      warning: 'bg-warning-container text-on-warning-container',
    };
    return map[type] ?? map['info'];
  }

  protected iconName(type: string): string {
    const map: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning',
    };
    return map[type] ?? 'info';
  }
}
