import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminApiService } from '../../core/services/admin-api.service';
import { Account } from '../../core/models/clock.model';
import { DashboardResponse } from '../../core/models/admin.model';

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly Math = Math;

  readonly accounts = signal<Account[]>([]);
  readonly isLoadingAccounts = signal(false);
  readonly isLoadingStats = signal(false);
  readonly stats = signal<DashboardResponse | null>(null);

  readonly filterForm = this.fb.group({
    accountId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  ngOnInit(): void {
    // Set sensible default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.filterForm.patchValue({
      startDate: firstDay.toISOString().substring(0, 10),
      endDate: now.toISOString().substring(0, 10),
    });

    this.isLoadingAccounts.set(true);
    this.api
      .getAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (accounts) => {
          this.accounts.set(accounts);
          this.isLoadingAccounts.set(false);
        },
        error: () => this.isLoadingAccounts.set(false),
      });
  }

  getDataValue(data: number[], index: number): number {
    return data[index] ?? 0;
  }

  loadStats(): void {
    if (this.filterForm.invalid) return;
    const { accountId, startDate, endDate } = this.filterForm.value;
    this.isLoadingStats.set(true);
    this.stats.set(null);

    this.api
      .getDashboard({ accountId: accountId!, startDate: startDate!, endDate: endDate! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.isLoadingStats.set(false);
        },
        error: () => this.isLoadingStats.set(false),
      });
  }
}
