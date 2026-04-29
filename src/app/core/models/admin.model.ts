import { ClockRecord } from './clock.model';

export interface WorkPeriodAccount {
  id: string;
  account: { id: string; name: string; bc: boolean };
  workPeriod: { id: string; year: number; month: number; week: number; periodLabel: string };
  startDate: string;
  endDate: string;
  closed: boolean;
}

export interface EmployeeHoursSummary {
  employeeId: string;
  employeeName: string;
  employeeIdNumber: string;
  totalHours: number;
  accountId: string;
}

export interface ActivitiesDto {
  workPeriodAccountId: string;
}

export interface ActivitiesRangeDto {
  accountId: string;
  startDate: string;
  endDate: string;
}

export interface ActivitiesResponse {
  incompleteMarkings: ClockRecord[];
  summaryByEmployee: EmployeeHoursSummary[];
  lastReport: LocalReport | null;
}

export interface EmployeeDetailDto {
  employeeId: string;
  startDate: string;
  endDate: string;
  accountId: string;
}

export interface DashboardDto {
  startDate: string;
  endDate: string;
  accountId: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  hoverBackgroundColor?: string | string[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface LocalReport {
  id: string;
  accountId: string;
  accountName: string;
  workPeriodAccountId: string;
  workPeriodLabel: string;
  markingIds: string[];
  sentBy: string;
  totalMarkings: number;
  createdAt: string;
  updatedAt: string;
}

export interface SendReportDto {
  workPeriodAccountId: string;
}

export interface PayrollPreviewEntry {
  positionId: string;
  positionName: string;
  hours: number;
  isOverTime: boolean;
}

export interface PayrollPreviewEmployee {
  employeeId: string;
  employeeName: string;
  employeeIdNumber: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  entries: PayrollPreviewEntry[];
}

export interface PayrollPreview {
  workPeriodAccountId: string;
  accountName: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalEmployees: number;
  totalHours: number;
  totalOvertimeHours: number;
  employees: PayrollPreviewEmployee[];
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  positionId: string;
  positionName: string;
  quantity: number;
  isOverTime: boolean;
  startDate: string;
  endDate: string;
  comments: string;
}

export interface DashboardResponse {
  countActivities: number;
  countClocks: number;
  countHoursWorked: number;
  countEmployees: number;
  employeesVsHoursWorked: ChartData;
  departmentVsHoursWorked: ChartData;
  employeesVsOvertime: ChartData;
}
