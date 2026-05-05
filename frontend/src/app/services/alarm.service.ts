import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Alarm, AlarmEvent, AlarmFilter, AlarmRequest, AlarmSummary,
  AcknowledgeRequest, ApiResponse, PagedResponse
} from '../models/alarm.model';

/**
 * AlarmService — Angular HTTP service for all backend API calls.
 */
@Injectable({ providedIn: 'root' })
export class AlarmService {

  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/alarms`;

  // ===========================
  // CRUD
  // ===========================

  getAlarms(filter: AlarmFilter): Observable<ApiResponse<PagedResponse<Alarm>>> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('size', filter.size)
      .set('sortBy', filter.sortBy)
      .set('sortDir', filter.sortDir);

    if (filter.severity)  params = params.set('severity', filter.severity);
    if (filter.state)     params = params.set('state', filter.state);
    if (filter.keyword)   params = params.set('keyword', filter.keyword);

    return this.http.get<ApiResponse<PagedResponse<Alarm>>>(this.base, { params });
  }

  getAlarmById(id: number): Observable<Alarm> {
    return this.http.get<ApiResponse<Alarm>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  createAlarm(request: AlarmRequest): Observable<Alarm> {
    return this.http.post<ApiResponse<Alarm>>(this.base, request)
      .pipe(map(r => r.data));
  }

  updateAlarm(id: number, request: AlarmRequest): Observable<Alarm> {
    return this.http.put<ApiResponse<Alarm>>(`${this.base}/${id}`, request)
      .pipe(map(r => r.data));
  }

  deleteAlarm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // ===========================
  // Business Operations
  // ===========================

  acknowledgeAlarm(id: number, request: AcknowledgeRequest): Observable<Alarm> {
    return this.http.patch<ApiResponse<Alarm>>(`${this.base}/${id}/acknowledge`, request)
      .pipe(map(r => r.data));
  }

  clearAlarm(id: number, operatorName: string = 'OPERATOR'): Observable<Alarm> {
    const params = new HttpParams().set('operatorName', operatorName);
    return this.http.patch<ApiResponse<Alarm>>(`${this.base}/${id}/clear`, {}, { params })
      .pipe(map(r => r.data));
  }

  // ===========================
  // Events
  // ===========================

  getAlarmEvents(id: number): Observable<AlarmEvent[]> {
    return this.http.get<ApiResponse<AlarmEvent[]>>(`${this.base}/${id}/events`)
      .pipe(map(r => r.data));
  }

  // ===========================
  // Summary
  // ===========================

  getSummary(): Observable<AlarmSummary> {
    return this.http.get<ApiResponse<AlarmSummary>>(`${this.base}/summary`)
      .pipe(map(r => r.data));
  }
}
