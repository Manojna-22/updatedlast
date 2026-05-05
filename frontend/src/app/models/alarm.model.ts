// ===========================
// Enums
// ===========================

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlarmState = 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED';

// ===========================
// Core Models
// ===========================

export interface Alarm {
  id: number;
  code: string;
  message: string;
  severity: Severity;
  state: AlarmState;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlarmEvent {
  id: number;
  alarmId: number;
  ts: string;
  state: AlarmState;
  performedBy: string;
  note?: string;
}

export interface AlarmSummary {
  totalAlarms: number;
  activeCount: number;
  acknowledgedCount: number;
  clearedCount: number;
  activeLow: number;
  activeMedium: number;
  activeHigh: number;
  activeCritical: number;
}

// ===========================
// Request DTOs
// ===========================

export interface AlarmRequest {
  code: string;
  message: string;
  severity: Severity;
}

export interface AcknowledgeRequest {
  operatorName: string;
  note?: string;
}

// ===========================
// API Response Wrappers
// ===========================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ===========================
// Filter / Query Params
// ===========================

export interface AlarmFilter {
  severity?: Severity | '';
  state?: AlarmState | '';
  keyword?: string;
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
}
