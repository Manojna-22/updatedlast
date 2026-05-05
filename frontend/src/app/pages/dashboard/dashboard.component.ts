import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subject, Subscription } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { AlarmService } from '../../services/alarm.service';
import { AuthService } from '../../services/auth.service';
import { Alarm, AlarmFilter, AlarmSummary, AlarmRequest, PagedResponse } from '../../models/alarm.model';

import { SeverityLegendComponent } from '../../components/severity-legend/severity-legend.component';
import { AlarmFilterComponent } from '../../components/alarm-filter/alarm-filter.component';
import { AlarmListComponent } from '../../components/alarm-list/alarm-list.component';
import { DonutChartComponent } from '../../components/donut-chart/donut-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SeverityLegendComponent,
    AlarmFilterComponent,
    AlarmListComponent,
    DonutChartComponent
  ],
  template: `
    <div class="dashboard">

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Alarm Dashboard</h1>
          <span class="last-updated" *ngIf="lastUpdated">
            Last updated: {{ lastUpdated | date:'HH:mm:ss' }}
          </span>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="toggleAutoRefresh()">
            {{ autoRefresh ? '⏸ Pause Auto-Refresh' : '▶ Auto-Refresh (10s)' }}
          </button>
          <button class="btn-secondary" (click)="refresh()">↻ Refresh</button>
          <button class="btn-primary" *ngIf="auth.isAdmin" (click)="openCreateModal()">+ New Alarm</button>
          <div class="operator-notice" *ngIf="auth.isOperator">
            <span>👤 Operator Mode</span>
          </div>
        </div>
      </div>

      <!-- Summary Legend -->
      <section class="section">
        <app-severity-legend [summary]="summary"></app-severity-legend>
      </section>

      <!-- Charts + Filter Row -->
      <section class="section charts-row">
        <app-donut-chart [summary]="summary" class="donut-panel"></app-donut-chart>
        <div class="filter-panel">
          <app-alarm-filter [filter]="filter" (filterChange)="onFilterChange($event)"></app-alarm-filter>
        </div>
      </section>

      <!-- Alarm List -->
      <section class="section">
        <app-alarm-list
          [alarms]="alarms"
          [loading]="loading"
          [isAdmin]="auth.isAdmin"
          [currentPage]="filter.page"
          [totalPages]="totalPages"
          [totalElements]="totalElements"
          (pageChange)="onPageChange($event)"
          (acknowledge)="onAcknowledge($event)"
          (clear)="onClear($event)"
          (delete)="onDelete($event)"
          (viewEvents)="openEventsModal($event)"
        ></app-alarm-list>
      </section>

    </div>

    <!-- ===== Create Alarm Modal ===== -->
    <div class="modal-backdrop" *ngIf="showCreateModal" (click)="closeCreateModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Create New Alarm</h2>
          <button class="modal-close" (click)="closeCreateModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Alarm Code <span class="req">*</span></label>
            <input class="form-input" type="text" [(ngModel)]="newAlarm.code"
                   placeholder="e.g. MOTOR-OVERLOAD-001"
                   style="text-transform:uppercase" />
            <small>Uppercase letters, numbers, underscores, hyphens only</small>
          </div>
          <div class="form-group">
            <label>Message <span class="req">*</span></label>
            <input class="form-input" type="text" [(ngModel)]="newAlarm.message"
                   placeholder="Describe what triggered this alarm" />
          </div>
          <div class="form-group">
            <label>Severity <span class="req">*</span></label>
            <select class="form-input" [(ngModel)]="newAlarm.severity">
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
          <div class="modal-error" *ngIf="formError">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeCreateModal()">Cancel</button>
          <button class="btn-primary" (click)="submitCreate()" [disabled]="createLoading">
            {{ createLoading ? 'Creating...' : 'Create Alarm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Events Modal ===== -->
    <div class="modal-backdrop" *ngIf="showEventsModal" (click)="closeEventsModal()">
      <div class="modal modal-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Alarm Event History</h2>
          <button class="modal-close" (click)="closeEventsModal()">✕</button>
        </div>
        <div class="modal-body">
          <div *ngIf="eventsLoading" class="loading-text">Loading events...</div>
          <table class="events-table" *ngIf="!eventsLoading && alarmEvents.length > 0">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>State</th>
                <th>Performed By</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let event of alarmEvents">
                <td>{{ event.ts | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                <td>
                  <span class="state-badge" [class]="'state-' + event.state.toLowerCase()">
                    {{ event.state }}
                  </span>
                </td>
                <td>{{ event.performedBy }}</td>
                <td>{{ event.note || '—' }}</td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="!eventsLoading && alarmEvents.length === 0" class="empty-text">
            No events recorded.
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" [class.visible]="toastVisible" [class.toast-error]="toastError">
      {{ toastMessage }}
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1600px;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }
    .last-updated { font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 2px; }
    .operator-notice {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3);
      color: var(--color-low);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 0.9rem;
      border-radius: 8px;
    }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }
    .section {}
    .charts-row { display: flex; gap: 1.5rem; align-items: flex-start; }
    .donut-panel { flex-shrink: 0; width: 260px; }
    .filter-panel { flex: 1; }

    /* Buttons */
    .btn-primary {
      background: var(--color-accent);
      color: #000;
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.2rem;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.85; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem 1.2rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: var(--color-accent); color: var(--color-accent); }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .modal {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 480px;
      max-width: 95vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .modal-large { width: 700px; }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .modal-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    .modal-close:hover { background: var(--bg-hover); color: var(--text-primary); }
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
    .form-group small { font-size: 0.7rem; color: var(--text-muted); }
    .req { color: var(--color-critical); }
    .form-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      padding: 0.6rem 0.75rem;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus { border-color: var(--color-accent); }
    .modal-error {
      background: rgba(239,68,68,0.1);
      border: 1px solid var(--color-critical);
      border-radius: 8px;
      padding: 0.6rem 0.9rem;
      color: var(--color-critical);
      font-size: 0.85rem;
    }

    /* Events table */
    .events-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .events-table th {
      text-align: left;
      padding: 0.5rem 0.75rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
    }
    .events-table td {
      padding: 0.6rem 0.75rem;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-secondary);
    }
    .state-badge {
      display: inline-block; padding: 2px 8px; border-radius: 20px;
      font-size: 0.68rem; font-weight: 700;
    }
    .state-active       { background: rgba(239,68,68,0.2);  color: var(--color-critical); }
    .state-acknowledged { background: rgba(245,158,11,0.2); color: var(--color-medium); }
    .state-cleared      { background: rgba(107,114,128,0.2); color: var(--text-muted); }

    .loading-text, .empty-text { text-align: center; padding: 2rem; color: var(--text-muted); }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--color-low);
      color: #000;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.875rem;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s;
      z-index: 9999;
      pointer-events: none;
    }
    .toast.visible { opacity: 1; transform: translateY(0); }
    .toast.toast-error { background: var(--color-critical); color: #fff; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {

  alarms: Alarm[] = [];
  summary: AlarmSummary | null = null;
  loading = false;
  totalPages = 0;
  totalElements = 0;

  filter: AlarmFilter = {
    severity: '',
    state: '',
    keyword: '',
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'DESC'
  };

  // Auto-refresh
  autoRefresh = true;
  lastUpdated: Date | null = null;
  private refreshSub?: Subscription;
  private destroy$ = new Subject<void>();

  // Modals
  showCreateModal = false;
  showEventsModal = false;
  alarmEvents: any[] = [];
  eventsLoading = false;
  createLoading = false;
  formError = '';

  newAlarm: AlarmRequest = { code: '', message: '', severity: 'MEDIUM' };

  // Toast
  toastMessage = '';
  toastVisible = false;
  toastError = false;
  private toastTimer: any;

  constructor(private alarmService: AlarmService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadAll();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refreshSub?.unsubscribe();
  }

  // ===========================
  // Data Loading
  // ===========================

  loadAll(): void {
    this.loadAlarms();
    this.loadSummary();
  }

  loadAlarms(): void {
    this.loading = true;
    this.alarmService.getAlarms(this.filter).subscribe({
      next: (res) => {
        this.alarms = res.data.content;
        this.totalPages = res.data.totalPages;
        this.totalElements = res.data.totalElements;
        this.lastUpdated = new Date();
        this.loading = false;
      },
      error: (err) => {
        this.showToast('Failed to load alarms', true);
        this.loading = false;
      }
    });
  }

  loadSummary(): void {
    this.alarmService.getSummary().subscribe({
      next: (summary) => { this.summary = summary; },
      error: () => {}
    });
  }

  refresh(): void {
    this.loadAll();
  }

  // ===========================
  // Auto-Refresh
  // ===========================

  startAutoRefresh(): void {
    this.refreshSub?.unsubscribe();
    if (this.autoRefresh) {
      this.refreshSub = interval(10000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAll());
    }
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    this.startAutoRefresh();
  }

  // ===========================
  // Filter / Pagination
  // ===========================

  onFilterChange(f: AlarmFilter): void {
    this.filter = { ...f, page: 0 };
    this.loadAlarms();
  }

  onPageChange(page: number): void {
    this.filter = { ...this.filter, page };
    this.loadAlarms();
  }

  // ===========================
  // Alarm Operations
  // ===========================

  onAcknowledge(payload: { alarm: Alarm; operatorName: string; note: string }): void {
    this.alarmService.acknowledgeAlarm(payload.alarm.id, {
      operatorName: payload.operatorName,
      note: payload.note
    }).subscribe({
      next: () => {
        this.showToast(`Alarm ${payload.alarm.code} acknowledged`);
        this.loadAll();
      },
      error: (err) => this.showToast(err?.error?.message || 'Failed to acknowledge', true)
    });
  }

  onClear(alarm: Alarm): void {
    const operatorName = this.auth.currentUser?.displayName || 'OPERATOR';
    this.alarmService.clearAlarm(alarm.id, operatorName).subscribe({
      next: () => {
        this.showToast(`Alarm ${alarm.code} cleared`);
        this.loadAll();
      },
      error: (err) => this.showToast(err?.error?.message || 'Failed to clear', true)
    });
  }

  onDelete(alarm: Alarm): void {
    this.alarmService.deleteAlarm(alarm.id).subscribe({
      next: () => {
        this.showToast(`Alarm ${alarm.code} deleted`);
        this.loadAll();
      },
      error: () => this.showToast('Failed to delete', true)
    });
  }

  // ===========================
  // Create Modal
  // ===========================

  openCreateModal(): void {
    this.newAlarm = { code: '', message: '', severity: 'MEDIUM' };
    this.formError = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitCreate(): void {
    this.formError = '';
    if (!this.newAlarm.code.trim()) { this.formError = 'Alarm code is required'; return; }
    if (!this.newAlarm.message.trim()) { this.formError = 'Message is required'; return; }

    this.createLoading = true;
    const payload = { ...this.newAlarm, code: this.newAlarm.code.toUpperCase() };

    this.alarmService.createAlarm(payload).subscribe({
      next: (alarm) => {
        this.createLoading = false;
        this.closeCreateModal();
        this.showToast(`Alarm ${alarm.code} created`);
        this.loadAll();
      },
      error: (err) => {
        this.createLoading = false;
        this.formError = err?.error?.message || 'Failed to create alarm';
      }
    });
  }

  // ===========================
  // Events Modal
  // ===========================

  openEventsModal(alarmId: number): void {
    this.alarmEvents = [];
    this.eventsLoading = true;
    this.showEventsModal = true;
    this.alarmService.getAlarmEvents(alarmId).subscribe({
      next: (events) => { this.alarmEvents = events; this.eventsLoading = false; },
      error: () => { this.eventsLoading = false; }
    });
  }

  closeEventsModal(): void {
    this.showEventsModal = false;
  }

  // ===========================
  // Toast
  // ===========================

  showToast(message: string, isError = false): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastError = isError;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }
}
