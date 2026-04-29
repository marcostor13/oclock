export interface Account {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
}

export interface Department {
  _id: string;
  name: string;
}

export interface Position {
  id: string;
  name: string;
}

export interface EmployeeClock {
  employeeId: string;
  employeeName: string;
  employeeIdNumber: string;
  positions: Position[];
}

export interface ClockRecord {
  id?: string;
  accountId?: string;
  accountName?: string;
  employeeIdNumber?: string;
  employeeName?: string;
  positionId?: string;
  positionName?: string;
  checkin?: string;
  checkout?: string;
  sent?: boolean;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface CreateClockPayload {
  accountId: string;
  employeeIdNumber: string;
  positionId: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface LastClockBody {
  employeeIdNumber: string;
  accountId: string;
}
