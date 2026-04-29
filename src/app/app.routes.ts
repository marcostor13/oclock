import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public: clock-in flow (no auth required)
  {
    path: 'clock/:accountId',
    loadChildren: () => import('./features/clock/clock.routes').then((m) => m.CLOCK_ROUTES),
  },

  // Public: auth pages
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then((m) => m.ResetPassword),
  },

  // Protected: backoffice shell wraps all admin routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/shell').then((m) => m.Shell),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'markings',
        loadChildren: () =>
          import('./features/markings/markings.routes').then((m) => m.MARKINGS_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'sent-reports',
        loadChildren: () =>
          import('./features/sent-reports/sent-reports.routes').then((m) => m.SENT_REPORTS_ROUTES),
      },
      {
        path: 'qr',
        loadComponent: () =>
          import('./features/qr-generator/qr-generator').then((m) => m.QrGenerator),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
