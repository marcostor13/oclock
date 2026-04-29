import { Routes } from '@angular/router';

export const CLOCK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./clock-page/clock-page').then((m) => m.ClockPage),
  },
];
