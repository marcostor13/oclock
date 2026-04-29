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
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ClockRecord } from '../../../core/models/clock.model';

interface DayGroup {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Mon, Apr 28"
  records: ClockRecord[];
  totalHours: number;
}

@Component({
  selector: 'app-employee-detail',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './employee-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetail implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  // Route param: SQL EmployeeID (string)
  readonly employeeId = input<string>('');

  // Query params via toSignal
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly accountId = computed(() => this.queryParams().get('accountId') ?? '');
  readonly startDate = computed(() => this.queryParams().get('startDate') ?? '');
  readonly endDate = computed(() => this.queryParams().get('endDate') ?? '');
  readonly employeeName = computed(
    () => this.queryParams().get('employeeName') ?? this.employeeId(),
  );

  readonly records = signal<ClockRecord[]>([]);
  readonly isLoading = signal(false);

  // Group records by date, pairing checkin/checkout per day
  readonly dayGroups = computed<DayGroup[]>(() => {
    const recs = this.records();
    const map = new Map<string, ClockRecord[]>();

    for (const r of recs) {
      const dateKey = this.toDateKey(r.checkin ?? r.checkout ?? '');
      if (!dateKey) continue;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(r);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dayRecs]) => ({
        date,
        label: this.formatDateLabel(date),
        records: dayRecs,
        totalHours: dayRecs.reduce((sum, r) => sum + this.calcHours(r), 0),
      }));
  });

  readonly totalHours = computed(() =>
    this.dayGroups().reduce((s, d) => s + d.totalHours, 0),
  );

  // Edit modal
  readonly editingRecord = signal<ClockRecord | null>(null);
  readonly isSubmittingEdit = signal(false);
  readonly editError = signal<string | null>(null);

  readonly editForm = this.fb.group({
    checkin: ['', Validators.required],
    checkout: [''],
  });

  protected readonly Math = Math;

  // Export
  readonly isExporting = signal(false);

  ngOnInit(): void {
    this.loadRecords();
  }

  private loadRecords(): void {
    const empId = this.employeeId();
    const accountId = this.accountId();
    const startDate = this.startDate();
    const endDate = this.endDate();
    if (!empId) return;

    this.isLoading.set(true);
    this.api
      .getEmployeeClocks({
        employeeId: empId,
        startDate,
        endDate,
        accountId: accountId || '',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (records) => {
          this.records.set(records ?? []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  // --- Edit ---

  openEdit(record: ClockRecord): void {
    if (this.isRecordLocked(record)) return;
    this.editingRecord.set(record);
    this.editError.set(null);
    this.editForm.patchValue({
      checkin: record.checkin ? this.toDatetimeLocal(record.checkin) : '',
      checkout: record.checkout ? this.toDatetimeLocal(record.checkout) : '',
    });
  }

  closeEdit(): void {
    this.editingRecord.set(null);
  }

  submitEdit(): void {
    const record = this.editingRecord();
    if (!record?.id) return;

    const { checkin, checkout } = this.editForm.value;

    if (checkout && checkin && new Date(checkout) <= new Date(checkin)) {
      this.editError.set('Check-out must be after check-in.');
      return;
    }

    this.isSubmittingEdit.set(true);
    this.editError.set(null);

    const body: Partial<ClockRecord> = {};
    if (checkin) body.checkin = new Date(checkin).toISOString();
    if (checkout) body.checkout = new Date(checkout).toISOString();

    this.api
      .updateClock(record.id!, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.records.update((recs) =>
            recs.map((r) => (r.id === updated.id ? updated : r)),
          );
          this.isSubmittingEdit.set(false);
          this.closeEdit();
          this.toast.success('Marking updated successfully.');
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to update. This record may be locked.';
          this.editError.set(msg);
          this.toast.error(msg);
          this.isSubmittingEdit.set(false);
        },
      });
  }

  // --- Delete ---

  async deleteRecord(id: string): Promise<void> {
    const ok = await this.confirm.open(
      'Delete Marking?',
      'This action cannot be undone.',
      'Delete',
    );
    if (!ok) return;

    this.api
      .deleteClock(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.records.update((recs) => recs.filter((r) => r.id !== id));
          this.toast.success('Marking deleted.');
        },
        error: () => this.toast.error('Failed to delete marking.'),
      });
  }

  exportExcel(): void {
    const empId = this.employeeId();
    const accountId = this.accountId();
    const startDate = this.startDate();
    const endDate = this.endDate();
    if (!empId) return;

    this.isExporting.set(true);
    this.api
      .exportEmployeeClocks({
        employeeId: empId,
        startDate,
        endDate,
        accountId: accountId || '',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob as Blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `employee-${this.employeeName()}-clocks.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.isExporting.set(false);
        },
        error: () => this.isExporting.set(false),
      });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  // --- Helpers ---

  isRecordLocked(record: ClockRecord): boolean {
    // Records with a sent report flag are immutable (HU-4.2)
    return !!(record as Record<string, unknown>)['sent'];
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

  private toDateKey(iso: string): string {
    if (!iso) return '';
    return iso.substring(0, 10);
  }

  private formatDateLabel(dateKey: string): string {
    const d = new Date(dateKey + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  private toDatetimeLocal(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
