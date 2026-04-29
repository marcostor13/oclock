import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/user.model';
import { TokenService } from './token.service';

interface BackendAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  unrestrictedAccountAccess: boolean;
}

interface BackendLoginResponse {
  accessToken: string;
  user: BackendAuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  private readonly _currentUser = signal<AuthUser | null>(
    this.tokenService.getUser<AuthUser>(),
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  login(email: string, password: string) {
    return this.http
      .post<BackendLoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          const user: AuthUser = {
            _id: res.user.id,
            name: [res.user.firstName, res.user.lastName].filter(Boolean).join(' '),
            email: res.user.email,
            role: res.user.role,
          };
          this.tokenService.setToken(res.accessToken);
          this.tokenService.setUser(user);
          this._currentUser.set(user);
        }),
      );
  }

  updateProfile(id: string, body: Partial<Pick<AuthUser, 'name' | 'email'>>) {
    const [firstName, ...rest] = (body.name ?? '').split(' ');
    const lastName = rest.join(' ');
    return this.http
      .patch<BackendAuthUser>(`${environment.apiUrl}/user/${id}`, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: body.email,
      })
      .pipe(
        map((u) => ({
          _id: u.id,
          name: [u.firstName, u.lastName].filter(Boolean).join(' '),
          email: u.email,
          role: u.role,
        } as AuthUser)),
        tap((user) => {
          this.tokenService.setUser(user);
          this._currentUser.set(user);
        }),
      );
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.patch(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  logout(): void {
    this.tokenService.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
