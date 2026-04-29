import { Routes } from '@angular/router';

export const MARKINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./markings-list/markings-list').then((m) => m.MarkingsList),
  },
  {
    path: ':employeeId',
    loadComponent: () => import('./employee-detail/employee-detail').then((m) => m.EmployeeDetail),
  },
];
