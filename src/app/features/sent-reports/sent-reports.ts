import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';
import { AdminApiService } from '../../core/services/admin-api.service';
import { LocalReport } from '../../core/models/admin.model';
import { Account } from '../../core/models/clock.model';

@Component({
  selector: 'app-sent-reports',
  imports: [DatePipe],
  templateUrl: './sent-reports.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SentReports implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly reports = signal<LocalReport[]>([]);
  readonly accounts = signal<Account[]>([]);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({
      reports: this.api.getSentReports().pipe(catchError(() => of([] as LocalReport[]))),
      accounts: this.api.getAccounts().pipe(catchError(() => of([] as Account[]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ reports, accounts }) => {
          this.reports.set(reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
          this.accounts.set(accounts);
          this.isLoading.set(false);
        },
        error: () => {
          this.loadError.set('Failed to load sent reports.');
          this.isLoading.set(false);
        },
      });
  }

  viewReport(report: LocalReport): void {
    void this.router.navigate([report.id], { relativeTo: this.route });
  }

  accountName(accountId: string): string {
    return this.accounts().find((a) => a.id === accountId)?.name ?? `Account ${accountId}`;
  }
}
