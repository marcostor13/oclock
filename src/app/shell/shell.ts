import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../core/services/auth.service';
import { AlertsService } from '../core/services/alerts.service';
import { ConfirmService } from '../core/services/confirm.service';
import { ToastContainer } from '../core/components/toast-container/toast-container';
import { ConfirmDialog } from '../core/components/confirm-dialog/confirm-dialog';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainer, ConfirmDialog],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  protected readonly alerts = inject(AlertsService);

  protected readonly currentUser = this.auth.currentUser;
  protected readonly sidebarOpen = signal(false);
  protected readonly notifOpen = signal(false);

  protected readonly userInitials = computed(() => {
    const name = this.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map((p) => p.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Markings', icon: 'schedule', route: '/markings' },
    { label: 'Reports', icon: 'description', route: '/reports' },
    { label: 'Sent Reports', icon: 'send', route: '/sent-reports' },
    { label: 'QR Generator', icon: 'qr_code', route: '/qr' },
  ];

  constructor() {
    // Close mobile sidebar on navigation
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.sidebarOpen.set(false));
  }

  ngOnInit(): void {
    this.alerts.start();
  }

  protected openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected toggleNotif(): void {
    this.notifOpen.update((v) => !v);
  }

  protected closeNotif(): void {
    this.notifOpen.set(false);
  }

  protected goToAlert(accountId: string): void {
    this.alerts.dismiss(accountId);
    this.notifOpen.set(false);
    this.router.navigate(['/markings'], { queryParams: { accountId } });
  }

  protected async logout(): Promise<void> {
    const ok = await this.confirm.open('Sign out', 'Are you sure you want to sign out?', 'Sign out');
    if (ok) this.auth.logout();
  }
}
