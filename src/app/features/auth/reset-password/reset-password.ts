import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly prefillEmail = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  protected get passwordsMatch(): boolean {
    const { newPassword, confirmPassword } = this.form.value;
    return newPassword === confirmPassword;
  }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.prefillEmail.set(email);
    if (email) {
      this.form.controls.email.setValue(email);
    }
  }

  protected submit(): void {
    if (this.form.invalid || !this.passwordsMatch || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);
    const { email, code, newPassword: password } = this.form.getRawValue();

    this.http
      .post(`${environment.apiUrl}/auth/save-new-password`, { email, code, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'The code is incorrect or has expired.');
          this.loading.set(false);
        },
      });
  }
}
