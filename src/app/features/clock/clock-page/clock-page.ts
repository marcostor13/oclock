import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, timer } from 'rxjs';
import { ClockApiService } from '../../../core/services/clock-api.service';
import { haversineMeters } from '../../../core/utils/haversine';
import { Account, ClockRecord, EmployeeClock } from '../../../core/models/clock.model';

type ClockStep = 'loading' | 'geo' | 'action' | 'form' | 'submitting' | 'success' | 'error';
type CheckInSubStep = 'id' | 'position';

// HU-1.3: 10 m radius as per spec
const CLOCK_RADIUS_METERS = 100000000;

@Component({
  selector: 'app-clock-page',
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './clock-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockPage implements OnInit {
  private readonly clockApi = inject(ClockApiService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly accountId = input<string>('');

  readonly step = signal<ClockStep>('loading');
  readonly account = signal<Account | null>(null);

  // Geo state
  readonly userLat = signal<number | null>(null);
  readonly userLng = signal<number | null>(null);
  readonly geoError = signal<string | null>(null);
  readonly geoLoading = signal(false);

  readonly distanceMeters = computed(() => {
    const a = this.account();
    const lat = this.userLat();
    const lng = this.userLng();
    if (!a || lat === null || lng === null) return null;
    const aLat = parseFloat(a.latitude);
    const aLng = parseFloat(a.longitude);
    if (isNaN(aLat) || isNaN(aLng)) return null;
    return haversineMeters(lat, lng, aLat, aLng);
  });

  // HU-1.3: blocked if denied or outside radius
  readonly canProceed = computed(() => {
    const d = this.distanceMeters();
    return !this.geoError() && d !== null && d <= CLOCK_RADIUS_METERS;
  });

  readonly clockType = signal<'in' | 'out'>('in');

  // Check-in sub-steps: 'id' → enter clockId, 'position' → pick from employee's positions
  readonly checkInSubStep = signal<CheckInSubStep>('id');
  readonly employeeInfo = signal<EmployeeClock | null>(null);
  readonly isLookingUp = signal(false);
  readonly lookupError = signal<string | null>(null);

  readonly clockIdForm = this.fb.group({
    clockId: ['', Validators.required],
  });

  readonly positionForm = this.fb.group({
    positionId: ['', Validators.required],
  });

  readonly checkOutForm = this.fb.group({
    clockId: ['', Validators.required],
  });

  readonly selectedPositionName = computed(() => {
    const id = this.positionForm.controls.positionId.value;
    return this.employeeInfo()?.positions.find((p) => p.id === id)?.name ?? '';
  });

  readonly successRecord = signal<ClockRecord | null>(null);
  readonly successType = signal<'in' | 'out'>('in');
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.accountId();
    if (!id) {
      this.errorMessage.set('No account ID provided.');
      this.step.set('error');
      return;
    }
    this.clockApi
      .getAccount(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (account) => {
          this.account.set(account);
          this.requestGeolocation();
        },
        error: () => {
          this.errorMessage.set('Account not found. Please check the URL.');
          this.step.set('error');
        },
      });
  }

  private requestGeolocation(): void {
    this.geoLoading.set(true);
    this.geoError.set(null);
    this.userLat.set(null);
    this.userLng.set(null);

    if (!('geolocation' in navigator)) {
      this.geoLoading.set(false);
      this.geoError.set('Geolocation is not supported by this browser.');
      this.step.set('geo');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLat.set(pos.coords.latitude);
        this.userLng.set(pos.coords.longitude);
        this.geoLoading.set(false);
        this.step.set(this.canProceed() ? 'action' : 'geo');
      },
      () => {
        this.geoLoading.set(false);
        this.geoError.set(
          'Location access denied. Please enable location permissions and try again.',
        );
        this.step.set('geo');
      },
      { timeout: 10_000 },
    );
  }

  retryGeo(): void {
    this.requestGeolocation();
  }

  proceedToAction(): void {
    this.step.set('action');
  }

  selectAction(type: 'in' | 'out'): void {
    this.clockType.set(type);
    this.checkInSubStep.set('id');
    this.employeeInfo.set(null);
    this.lookupError.set(null);
    this.clockIdForm.reset();
    this.positionForm.reset();
    this.step.set('form');
  }

  lookupEmployee(): void {
    if (this.clockIdForm.invalid) return;
    const clockId = this.clockIdForm.value.clockId!;
    this.isLookingUp.set(true);
    this.lookupError.set(null);

    this.clockApi
      .getEmployeePositions(clockId, this.accountId())
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((emp) => {
        this.isLookingUp.set(false);
        if (!emp) {
          this.lookupError.set('Employee not found or no positions assigned at this location.');
          return;
        }
        this.employeeInfo.set(emp);
        this.positionForm.reset();
        this.checkInSubStep.set('position');
      });
  }

  backToIdStep(): void {
    this.checkInSubStep.set('id');
    this.employeeInfo.set(null);
    this.lookupError.set(null);
    this.positionForm.reset();
  }

  submitCheckIn(): void {
    if (this.positionForm.invalid) return;
    const positionId = this.positionForm.value.positionId!;
    const emp = this.employeeInfo();
    if (!emp) return;
    this.step.set('submitting');

    this.clockApi
      .createClock({
        accountId: this.accountId(),
        employeeIdNumber: emp.employeeIdNumber,
        positionId,
        latitude: this.userLat() ?? undefined,
        longitude: this.userLng() ?? undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (record) => this.showSuccess(record, 'in'),
        error: () => {
          this.errorMessage.set('Failed to record check-in. Please try again.');
          this.step.set('error');
        },
      });
  }

  // HU-1.5: check-out fetches last open check-in and PATCHes it
  submitCheckOut(): void {
    if (this.checkOutForm.invalid) return;
    const clockId = this.checkOutForm.value.clockId!;
    const accountId = this.accountId();
    this.step.set('submitting');

    this.clockApi
      .getLastClock({ employeeIdNumber: clockId, accountId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lastClock) => {
          if (!lastClock?.id || !lastClock.checkin || lastClock.checkout) {
            this.errorMessage.set('No open check-in found for this employee ID.');
            this.step.set('error');
            return;
          }
          this.clockApi
            .updateClock(lastClock.id, { checkout: new Date().toISOString() })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (record) => this.showSuccess(record, 'out'),
              error: () => {
                this.errorMessage.set('Failed to record check-out. Please try again.');
                this.step.set('error');
              },
            });
        },
        error: () => {
          this.errorMessage.set('Could not find employee record. Please check your ID.');
          this.step.set('error');
        },
      });
  }

  // HU-1.6: show success + auto-reset after 5 seconds
  private showSuccess(record: ClockRecord, type: 'in' | 'out'): void {
    this.successRecord.set(record);
    this.successType.set(type);
    this.step.set('success');
    timer(5_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resetFlow());
  }

  resetFlow(): void {
    this.clockIdForm.reset();
    this.positionForm.reset();
    this.checkOutForm.reset();
    this.checkInSubStep.set('id');
    this.employeeInfo.set(null);
    this.lookupError.set(null);
    this.errorMessage.set(null);
    this.step.set('action');
  }
}
