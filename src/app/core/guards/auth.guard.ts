import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = () => {
  if (inject(TokenService).hasToken()) return true;
  return inject(Router).createUrlTree(['/login']);
};
