import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports-list/reports-list').then((m) => m.ReportsList),
  },
];
