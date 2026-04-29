import { Routes } from '@angular/router';

export const SENT_REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sent-reports').then((m) => m.SentReports),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./sent-report-detail/sent-report-detail').then((m) => m.SentReportDetail),
  },
];
