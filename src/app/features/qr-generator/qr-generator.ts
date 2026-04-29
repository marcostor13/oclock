import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminApiService } from '../../core/services/admin-api.service';
import { Account } from '../../core/models/clock.model';

@Component({
  selector: 'app-qr-generator',
  templateUrl: './qr-generator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrGenerator implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly accounts = signal<Account[]>([]);
  readonly selectedAccountId = signal<string | null>(null);
  readonly isLoadingAccounts = signal(true);
  readonly copySuccess = signal(false);
  readonly isDownloading = signal(false);

  readonly clockUrl = computed(() => {
    const id = this.selectedAccountId();
    if (!id) return null;
    return `${window.location.origin}/clock/${id}`;
  });

  readonly qrImageUrl = computed(() => {
    const url = this.clockUrl();
    if (!url) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&ecc=M&data=${encodeURIComponent(url)}`;
  });

  readonly selectedAccount = computed(() =>
    this.accounts().find((a) => a.id === this.selectedAccountId()),
  );

  ngOnInit(): void {
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
  }

  async copyUrl(): Promise<void> {
    const url = this.clockUrl();
    if (!url) return;
    await navigator.clipboard.writeText(url);
    this.copySuccess.set(true);
    setTimeout(() => this.copySuccess.set(false), 2000);
  }

  downloadQr(): void {
    const qrUrl = this.qrImageUrl();
    const account = this.selectedAccount();
    if (!qrUrl) return;
    this.isDownloading.set(true);
    this.http
      .get(qrUrl, { responseType: 'blob' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-${account?.name ?? this.selectedAccountId()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          this.isDownloading.set(false);
        },
        error: () => this.isDownloading.set(false),
      });
  }
}
