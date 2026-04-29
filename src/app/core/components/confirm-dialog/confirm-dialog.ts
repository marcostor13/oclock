import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svc.state()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'confirm-title'"
      >
        <div
          class="absolute inset-0 bg-scrim/50"
          (click)="svc.cancel()"
          aria-hidden="true"
        ></div>
        <div class="relative bg-surface-container-lowest rounded-2xl shadow-modal p-6 w-full max-w-sm space-y-5">
          <div class="space-y-1.5">
            <h2
              id="confirm-title"
              class="font-display text-headline-md font-bold text-on-surface"
            >{{ svc.state()!.title }}</h2>
            <p class="font-body text-body-md text-on-surface-variant">{{ svc.state()!.message }}</p>
          </div>
          <div class="flex gap-3 justify-end">
            <button
              type="button"
              (click)="svc.cancel()"
              class="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-display text-label-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="svc.accept()"
              class="px-4 py-2.5 rounded-xl bg-error text-on-error font-display text-label-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {{ svc.state()!.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialog {
  protected readonly svc = inject(ConfirmService);
}
