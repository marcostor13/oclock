import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { LocalReport, PayrollRecord } from '../../../core/models/admin.model';
import { ClockRecord } from '../../../core/models/clock.model';

interface DayGroup {
  date: string;
  label: string;
  records: ClockRecord[];
  totalHours: number;
}

@Component({
  selector: 'app-sent-report-detail',
  imports: [DatePipe],
  templateUrl: './sent-report-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SentReportDetail implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string>('');

  readonly report = signal<LocalReport | null>(null);
  readonly records = signal<ClockRecord[]>([]);
  readonly payrollRecords = signal<PayrollRecord[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly isExporting = signal(false);
  readonly isExportingPayroll = signal(false);

  readonly dayGroups = computed<DayGroup[]>(() => {
    const map = new Map<string, ClockRecord[]>();
    for (const r of this.records()) {
      const key = (r.checkin ?? r.checkout ?? '').substring(0, 10);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, recs]) => ({
        date,
        label: this.formatDateLabel(date),
        records: recs,
        totalHours: recs.reduce((s, r) => s + this.calcHours(r), 0),
      }));
  });

  readonly totalHours = computed(() =>
    this.dayGroups().reduce((s, d) => s + d.totalHours, 0),
  );

  readonly employeeSummary = computed(() => {
    const map = new Map<string, { name: string; hours: number }>();
    for (const r of this.records()) {
      const key = r.employeeIdNumber ?? '';
      if (!key) continue;
      const entry = map.get(key) ?? { name: r.employeeName ?? key, hours: 0 };
      entry.hours += this.calcHours(r);
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .map(([clockId, e]) => ({ clockId, name: e.name, hours: e.hours }))
      .sort((a, b) => b.hours - a.hours);
  });

  readonly payrollRegularHours = computed(() =>
    this.payrollRecords().filter((r) => !r.isOverTime).reduce((s, r) => s + r.quantity, 0),
  );

  readonly payrollOvertimeHours = computed(() =>
    this.payrollRecords().filter((r) => r.isOverTime).reduce((s, r) => s + r.quantity, 0),
  );

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      this.loadError.set('No report ID provided.');
      this.isLoading.set(false);
      return;
    }

    this.api
      .getSentReportById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (report) => {
          this.report.set(report);
          const clockLoad = report.markingIds?.length
            ? this.api.getClocksByIds(report.markingIds)
            : null;
          const payrollLoad = this.api.getPayrollsByReport(id);

          if (clockLoad) {
            clockLoad.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: (clocks) => this.records.set(clocks),
              error: () => this.loadError.set('Failed to load clock records.'),
            });
          }

          payrollLoad.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (payrolls) => {
              this.payrollRecords.set(payrolls);
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
          });
        },
        error: () => {
          this.loadError.set('Report not found.');
          this.isLoading.set(false);
        },
      });
  }

  exportExcel(): void {
    const rpt = this.report();
    if (!rpt) return;
    this.isExporting.set(true);
    this.api
      .exportActivities({ workPeriodAccountId: rpt.workPeriodAccountId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob as Blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `report-${rpt.workPeriodAccountId}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.isExporting.set(false);
        },
        error: () => this.isExporting.set(false),
      });
  }

  exportPayroll(format: 'xlsx' | 'pdf'): void {
    const rpt = this.report();
    if (!rpt) return;
    this.isExportingPayroll.set(true);
    this.api
      .exportPayrollReport(rpt.id, format)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob as Blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payroll-${rpt.id}.${format}`;
          a.click();
          URL.revokeObjectURL(url);
          this.isExportingPayroll.set(false);
        },
        error: () => this.isExportingPayroll.set(false),
      });
  }

  goBack(): void {
    void this.router.navigate(['../'], { relativeTo: this.route });
  }

  calcHours(record: ClockRecord): number {
    if (!record.checkin || !record.checkout) return 0;
    return (
      (new Date(record.checkout).getTime() - new Date(record.checkin).getTime()) /
      3_600_000
    );
  }

  formatHours(h: number): string {
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }

  private formatDateLabel(dateKey: string): string {
    return new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}
