import { Injectable, computed, inject, signal } from '@angular/core';
import { switchMap, catchError, of, timer, Subscription } from 'rxjs';
import { AdminApiService } from './admin-api.service';

export interface AccountAlert {
  accountId: string;
  accountName: string;
  count: number;
}

const POLL_INTERVAL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly api = inject(AdminApiService);

  private readonly _alerts = signal<AccountAlert[]>([]);
  private readonly _dismissed = signal<string[]>([]);
  private subscription: Subscription | null = null;
  private accountMap = new Map<string, string>();

  readonly notifications = computed(() => {
    const dismissed = new Set(this._dismissed());
    return this._alerts().filter((a) => !dismissed.has(a.accountId));
  });

  readonly count = computed(() =>
    this.notifications().reduce((sum, a) => sum + a.count, 0),
  );

  dismiss(accountId: string): void {
    this._dismissed.update((ids) => [...ids, accountId]);
  }

  start(): void {
    if (this.subscription) return;

    this.subscription = timer(0, POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => this.api.getAccounts().pipe(catchError(() => of([])))),
        switchMap((accounts) => {
          if (!accounts.length) return of([] as { accountId: string; count: number }[]);
          this.accountMap = new Map(accounts.map((a) => [a.id, a.name]));
          return this.api
            .getAlertsByAccount(accounts.map((a) => a.id))
            .pipe(catchError(() => of([] as { accountId: string; count: number }[])));
        }),
      )
      .subscribe((data) => {
        this._alerts.set(
          data
            .filter((a) => a.count > 0)
            .map((a) => ({
              accountId: a.accountId,
              accountName: this.accountMap.get(a.accountId) ?? a.accountId,
              count: a.count,
            })),
        );
      });
  }
}
