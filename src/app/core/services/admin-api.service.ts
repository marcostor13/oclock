import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Account } from '../models/clock.model';
import {
  ActivitiesDto,
  ActivitiesRangeDto,
  ActivitiesResponse,
  DashboardDto,
  DashboardResponse,
  EmployeeDetailDto,
  LocalReport,
  PayrollPreview,
  PayrollRecord,
  SendReportDto,
  WorkPeriodAccount,
} from '../models/admin.model';
import { ClockRecord } from '../models/clock.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getAccounts() {
    return this.http
      .get<{ results: Account[] }>(`${this.base}/configuration/accounts?limit=200`)
      .pipe(map((res) => res.results ?? []));
  }

  getWorkPeriods(accountId: string) {
    return this.http.get<WorkPeriodAccount[]>(
      `${this.base}/configuration/work-period-accounts/by-account/${accountId}`,
    );
  }

  getActivities(dto: ActivitiesDto) {
    return this.http.post<ActivitiesResponse>(`${this.base}/marking/activities`, dto);
  }

  getActivitiesByRange(dto: ActivitiesRangeDto) {
    return this.http.post<ActivitiesResponse>(`${this.base}/marking/activities-range`, dto);
  }

  exportActivitiesByRange(dto: ActivitiesRangeDto) {
    return this.http.post(`${this.base}/marking/export-activities-range`, dto, { responseType: 'blob' });
  }

  getEmployeeClocks(dto: EmployeeDetailDto) {
    return this.http.post<ClockRecord[]>(`${this.base}/marking/by-employee`, dto);
  }

  getDashboard(dto: DashboardDto) {
    return this.http.post<DashboardResponse>(`${this.base}/marking/dashboard`, dto);
  }

  updateClock(id: string, body: Partial<ClockRecord>) {
    return this.http.patch<ClockRecord>(`${this.base}/marking/${id}`, body);
  }

  deleteClock(id: string) {
    return this.http.delete(`${this.base}/marking/${id}`);
  }

  sendReport(dto: SendReportDto) {
    return this.http.post<LocalReport>(`${this.base}/marking/send-report`, dto);
  }

  getSentReports() {
    return this.http.get<LocalReport[]>(`${this.base}/local-report`);
  }

  getSentReportById(id: string) {
    return this.http.get<LocalReport>(`${this.base}/local-report/${id}`);
  }

  getClocksByIds(ids: string[]) {
    return this.http.post<ClockRecord[]>(`${this.base}/marking/by-ids`, { ids });
  }

  exportActivities(dto: ActivitiesDto) {
    return this.http.post(`${this.base}/marking/export-activities`, dto, { responseType: 'blob' });
  }

  exportEmployeeClocks(dto: EmployeeDetailDto) {
    return this.http.post(`${this.base}/marking/export-employee`, dto, { responseType: 'blob' });
  }

  getAlertsByAccount(accountIds: string[]) {
    return this.http.post<{ accountId: string; count: number }[]>(
      `${this.base}/marking/alerts-by-account`,
      { accountIds },
    );
  }

  previewPayroll(workPeriodAccountId: string) {
    return this.http.post<PayrollPreview>(`${this.base}/marking/preview-payroll`, {
      workPeriodAccountId,
    });
  }

  getPayrollsByReport(reportId: string) {
    return this.http.get<PayrollRecord[]>(`${this.base}/payroll/by-report/${reportId}`);
  }

  exportPayrollReport(reportId: string, format: 'xlsx' | 'pdf') {
    return this.http.get(`${this.base}/payroll/by-report/${reportId}/export?format=${format}`, {
      responseType: 'blob',
    });
  }
}
