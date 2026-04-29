import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentUser = this.auth.currentUser;

  protected readonly isSavingProfile = signal(false);
  protected readonly profileSaveError = signal<string | null>(null);
  protected readonly profileSaveSuccess = signal(false);

  protected readonly isSavingPassword = signal(false);
  protected readonly passwordSaveError = signal<string | null>(null);
  protected readonly passwordSaveSuccess = signal(false);

  protected readonly profileForm = this.fb.group({
    name: [this.currentUser()?.name ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.currentUser()?.email ?? '', [Validators.required, Validators.email]],
  });

  protected readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  protected get passwordsMatch(): boolean {
    const { newPassword, confirmPassword } = this.passwordForm.value;
    return newPassword === confirmPassword;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const user = this.currentUser();
    if (!user) return;

    this.isSavingProfile.set(true);
    this.profileSaveError.set(null);
    this.profileSaveSuccess.set(false);

    this.auth
      .updateProfile(user._id, this.profileForm.value as { name: string; email: string })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSavingProfile.set(false);
          this.profileSaveSuccess.set(true);
        },
        error: (err) => {
          this.profileSaveError.set(err?.error?.message ?? 'Failed to update profile.');
          this.isSavingProfile.set(false);
        },
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || !this.passwordsMatch) return;
    const user = this.currentUser();
    if (!user) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.isSavingPassword.set(true);
    this.passwordSaveError.set(null);
    this.passwordSaveSuccess.set(false);

    this.auth
      .changePassword(currentPassword!, newPassword!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSavingPassword.set(false);
          this.passwordSaveSuccess.set(true);
          this.passwordForm.reset();
        },
        error: (err) => {
          this.passwordSaveError.set(err?.error?.message ?? 'Failed to change password.');
          this.isSavingPassword.set(false);
        },
      });
  }
}
