import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Account,
  ClockRecord,
  CreateClockPayload,
  EmployeeClock,
  LastClockBody,
} from '../models/clock.model';

@Injectable({ providedIn: 'root' })
export class ClockApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getAccount(id: string) {
    return this.http.get<Account>(`${this.base}/clock/account/${id}`);
  }

  getEmployeePositions(idNumber: string, accountId: string) {
    return this.http.get<EmployeeClock>(
      `${this.base}/clock/employee/${encodeURIComponent(idNumber)}?accountId=${accountId}`,
    );
  }

  getLastClock(body: LastClockBody) {
    return this.http.post<ClockRecord | null>(`${this.base}/clock/last`, body);
  }

  createClock(payload: CreateClockPayload) {
    return this.http.post<ClockRecord>(`${this.base}/clock/checkin`, payload);
  }

  updateClock(id: string, body: Partial<ClockRecord>) {
    return this.http.patch<ClockRecord>(`${this.base}/clock/checkout/${id}`, body);
  }
}
