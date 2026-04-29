import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account } from '../../../core/models/clock.model';
import {
  ActivitiesResponse,
  EmployeeHoursSummary,
  LocalReport,
  PayrollPreview,
  WorkPeriodAccount,
} from '../../../core/models/admin.model';

@Component({
  selector: 'app-reports-list',
  imports: [DatePipe],
  templateUrl: './reports-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsList implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  readonly accounts = signal<Account[]>([]);
  readonly selectedAccountId = signal<string | null>(null);
  readonly workPeriods = signal<WorkPeriodAccount[]>([]);
  readonly selectedPeriodId = signal<string | null>(null);
  readonly activities = signal<ActivitiesResponse | null>(null);
  readonly lastReport = signal<LocalReport | null>(null);

  readonly isLoadingAccounts = signal(false);
  readonly isLoadingPeriods = signal(false);
  readonly isLoadingActivities = signal(false);
  readonly isSending = signal(false);
  readonly isExporting = signal(false);
  readonly isPreviewLoading = signal(false);

  readonly payrollPreview = signal<PayrollPreview | null>(null);
  readonly showPreviewModal = signal(false);

  readonly selectedPeriod = computed(() =>
    this.workPeriods().find((p) => p.id === this.selectedPeriodId()),
  );

  readonly incompleteMarkings = computed(
    () => this.activities()?.incompleteMarkings ?? [],
  );

  readonly employeeHours = computed(
    () => this.activities()?.summaryByEmployee ?? [],
  );

  readonly isAlreadySent = computed(() => {
    const lr = this.lastReport();
    return !!lr && !!lr.id;
  });

  readonly employeesWithIncomplete = computed(() => {
    const incompleteIds = new Set(
      this.incompleteMarkings()
        .map((r) => r.employeeIdNumber)
        .filter(Boolean),
    );
    return this.employeeHours().filter((e) => incompleteIds.has(e.employeeIdNumber));
  });

  ngOnInit(): void {
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

  onAccountChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedAccountId.set(id || null);
    this.selectedPeriodId.set(null);
    this.workPeriods.set([]);
    this.activities.set(null);
    this.lastReport.set(null);
    if (!id) return;

    this.isLoadingPeriods.set(true);
    this.api
      .getWorkPeriods(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (periods) => {
          this.workPeriods.set(periods);
          this.isLoadingPeriods.set(false);
        },
        error: () => this.isLoadingPeriods.set(false),
      });
  }

  onPeriodChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedPeriodId.set(id || null);
    this.activities.set(null);
    this.lastReport.set(null);
    if (!id) return;

    this.isLoadingActivities.set(true);
    this.api
      .getActivities({ workPeriodAccountId: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.activities.set(res);
          this.lastReport.set(res.lastReport ?? null);
          this.isLoadingActivities.set(false);
        },
        error: () => this.isLoadingActivities.set(false),
      });
  }

  requestSendReport(): void {
    const periodId = this.selectedPeriodId();
    if (!periodId) return;

    this.isPreviewLoading.set(true);
    this.api
      .previewPayroll(periodId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (preview) => {
          this.payrollPreview.set(preview);
          this.showPreviewModal.set(true);
          this.isPreviewLoading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load payroll preview. Please try again.');
          this.isPreviewLoading.set(false);
        },
      });
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    this.payrollPreview.set(null);
  }

  confirmSendReport(): void {
    const periodId = this.selectedPeriodId();
    if (!periodId) return;

    this.showPreviewModal.set(false);
    this.isSending.set(true);
    this.api
      .sendReport({ workPeriodAccountId: periodId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          this.lastReport.set(report);
          this.isSending.set(false);
          this.payrollPreview.set(null);
          this.toast.success('Report sent and payroll records generated.');
        },
        error: (err) => {
          const msg =
            (err as { error?: { message?: string } })?.error?.message ??
            'Failed to send report. It may have already been sent.';
          this.toast.error(msg);
          this.isSending.set(false);
        },
      });
  }

  exportExcel(): void {
    const periodId = this.selectedPeriodId();
    if (!periodId) return;

    this.isExporting.set(true);
    this.api
      .exportActivities({ workPeriodAccountId: periodId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob as Blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `activities-period-${periodId}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.isExporting.set(false);
        },
        error: () => {
          this.toast.error('Failed to export. Please try again.');
          this.isExporting.set(false);
        },
      });
  }

  fixEmployee(emp: EmployeeHoursSummary): void {
    const period = this.selectedPeriod();
    void this.router.navigate(['/markings', emp.employeeId], {
      queryParams: {
        accountId: emp.accountId,
        startDate: period?.startDate,
        endDate: period?.endDate,
        employeeName: emp.employeeName,
      },
    });
  }

  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}
