import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const { email } = this.form.getRawValue();
    this.http
      .post(`${environment.apiUrl}/email/send-code-without-register-email`, { email })
      .subscribe({
        next: () => {
          this.sent.set(true);
          this.loading.set(false);
          setTimeout(
            () => this.router.navigate(['/reset-password'], { queryParams: { email } }),
            2000,
          );
        },
        error: () => {
          this.error.set('Something went wrong. Please try again.');
          this.loading.set(false);
        },
      });
  }
}
