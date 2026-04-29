import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { Account } from '../../../core/models/clock.model';
import { EmployeeHoursSummary } from '../../../core/models/admin.model';

@Component({
  selector: 'app-markings-list',
  imports: [ReactiveFormsModule],
  templateUrl: './markings-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkingsList implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly accounts = signal<Account[]>([]);
  readonly employees = signal<EmployeeHoursSummary[]>([]);
  readonly incompleteCount = signal(0);

  readonly isLoadingAccounts = signal(false);
  readonly isLoadingEmployees = signal(false);
  readonly isExporting = signal(false);
  readonly hasLoaded = signal(false);

  readonly filterForm = this.fb.group({
    accountId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  ngOnInit(): void {
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
          const presetAccountId = this.route.snapshot.queryParamMap.get('accountId');
          if (presetAccountId) {
            this.filterForm.patchValue({ accountId: presetAccountId });
            this.loadActivities();
          }
        },
        error: () => this.isLoadingAccounts.set(false),
      });
  }

  loadActivities(): void {
    if (this.filterForm.invalid) return;
    const { accountId, startDate, endDate } = this.filterForm.value;
    this.isLoadingEmployees.set(true);
    this.employees.set([]);
    this.incompleteCount.set(0);

    this.api
      .getActivitiesByRange({ accountId: accountId!, startDate: startDate!, endDate: endDate! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.employees.set(res.summaryByEmployee ?? []);
          this.incompleteCount.set(res.incompleteMarkings?.length ?? 0);
          this.isLoadingEmployees.set(false);
          this.hasLoaded.set(true);
        },
        error: () => {
          this.isLoadingEmployees.set(false);
          this.hasLoaded.set(true);
        },
      });
  }

  viewEmployee(emp: EmployeeHoursSummary): void {
    const { startDate, endDate } = this.filterForm.value;
    this.router.navigate([emp.employeeId], {
      relativeTo: this.route,
      queryParams: {
        accountId: emp.accountId,
        startDate,
        endDate,
        employeeName: emp.employeeName,
      },
    });
  }

  exportExcel(): void {
    if (this.filterForm.invalid) return;
    const { accountId, startDate, endDate } = this.filterForm.value;
    this.isExporting.set(true);

    this.api
      .exportActivitiesByRange({ accountId: accountId!, startDate: startDate!, endDate: endDate! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob as Blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `activities-${startDate}-${endDate}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.isExporting.set(false);
        },
        error: () => this.isExporting.set(false),
      });
  }

  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
