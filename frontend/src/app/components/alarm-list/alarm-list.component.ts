import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Alarm } from '../../models/alarm.model';
import { AckButtonComponent } from '../ack-button/ack-button.component';

@Component({
  selector: 'app-alarm-list',
  standalone: true,
  imports: [CommonModule, DatePipe, AckButtonComponent],
  template: `
    <div class="alarm-table-wrapper">
      <!-- Loading -->
      <div class="loading-overlay" *ngIf="loading">
        <div class="spinner"></div>
        <span>Loading alarms...</span>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && alarms.length === 0">
        <div class="empty-icon">✓</div>
        <div class="empty-text">No alarms match the current filters</div>
      </div>

      <!-- Table -->
      <table class="alarm-table" *ngIf="!loading && alarms.length > 0">
        <thead>
          <tr>
            <th>Code</th>
            <th>Message</th>
            <th>Severity</th>
            <th>State</th>
            <th>Acknowledged By</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            *ngFor="let alarm of alarms; trackBy: trackById"
            [class]="'row-' + alarm.severity.toLowerCase()"
            [class.row-cleared]="alarm.state === 'CLEARED'"
          >
            <td>
              <span class="alarm-code">{{ alarm.code }}</span>
            </td>
            <td class="alarm-message">{{ alarm.message }}</td>
            <td>
              <span class="severity-badge" [class]="'sev-' + alarm.severity.toLowerCase()">
                {{ alarm.severity }}
              </span>
            </td>
            <td>
              <span class="state-badge" [class]="'state-' + alarm.state.toLowerCase()">
                {{ alarm.state }}
              </span>
            </td>
            <td class="acked-by">
              <span *ngIf="alarm.acknowledgedBy">
                {{ alarm.acknowledgedBy }}
                <small>{{ alarm.acknowledgedAt | date:'HH:mm dd/MM' }}</small>
              </span>
              <span *ngIf="!alarm.acknowledgedBy" class="text-muted">—</span>
            </td>
            <td class="created-at">
              {{ alarm.createdAt | date:'dd/MM HH:mm:ss' }}
            </td>
            <td>
              <app-ack-button
                [alarm]="alarm"
                [isAdmin]="isAdmin"
                (acknowledge)="onAcknowledge(alarm, $event)"
                (clear)="onClear(alarm)"
                (delete)="onDelete(alarm)"
                (viewEvents)="viewEvents.emit($event)"
              ></app-ack-button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" [disabled]="currentPage === 0" (click)="pageChange.emit(currentPage - 1)">
          ← Prev
        </button>
        <span class="page-info">
          Page {{ currentPage + 1 }} of {{ totalPages }}
          <small>({{ totalElements }} total)</small>
        </span>
        <button class="page-btn" [disabled]="currentPage >= totalPages - 1" (click)="pageChange.emit(currentPage + 1)">
          Next →
        </button>
      </div>
    </div>
  `,
  styles: [`
    .alarm-table-wrapper {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      min-height: 200px;
    }
    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      background: rgba(0,0,0,0.4);
      z-index: 10;
      color: var(--text-secondary);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-color);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 3rem; color: var(--color-low); }
    .empty-text { font-size: 0.9rem; }
    .alarm-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .alarm-table thead tr {
      background: var(--bg-primary);
      border-bottom: 2px solid var(--border-color);
    }
    .alarm-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .alarm-table tbody tr {
      border-bottom: 1px solid var(--border-color);
      transition: background 0.15s;
    }
    .alarm-table tbody tr:hover { background: var(--bg-hover); }
    .alarm-table td { padding: 0.7rem 1rem; vertical-align: middle; }

    /* Row severity indicators */
    .row-critical td:first-child { border-left: 3px solid var(--color-critical); }
    .row-high    td:first-child { border-left: 3px solid var(--color-high); }
    .row-medium  td:first-child { border-left: 3px solid var(--color-medium); }
    .row-low     td:first-child { border-left: 3px solid var(--color-low); }
    .row-cleared { opacity: 0.55; }

    .alarm-code { font-family: monospace; font-weight: 600; font-size: 0.8rem; }
    .alarm-message { max-width: 280px; }
    .created-at, .acked-by { white-space: nowrap; color: var(--text-secondary); font-size: 0.8rem; }
    .acked-by small { display: block; color: var(--text-muted); font-size: 0.7rem; }
    .text-muted { color: var(--text-muted); }

    /* Severity badges */
    .severity-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .sev-critical { background: rgba(239,68,68,0.15); color: var(--color-critical); border: 1px solid var(--color-critical); }
    .sev-high     { background: rgba(249,115,22,0.15); color: var(--color-high);     border: 1px solid var(--color-high); }
    .sev-medium   { background: rgba(245,158,11,0.15); color: var(--color-medium);   border: 1px solid var(--color-medium); }
    .sev-low      { background: rgba(34,197,94,0.15);  color: var(--color-low);      border: 1px solid var(--color-low); }

    /* State badges */
    .state-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.68rem;
      font-weight: 700;
    }
    .state-active       { background: rgba(239,68,68,0.2);  color: var(--color-critical); }
    .state-acknowledged { background: rgba(245,158,11,0.2); color: var(--color-medium); }
    .state-cleared      { background: rgba(107,114,128,0.2); color: var(--text-muted); }

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .page-btn {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.4rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
    .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .page-info { font-size: 0.85rem; color: var(--text-secondary); }
    .page-info small { color: var(--text-muted); }
  `]
})
export class AlarmListComponent {
  @Input() alarms: Alarm[] = [];
  @Input() loading = false;
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() isAdmin = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() acknowledge = new EventEmitter<{ alarm: Alarm; operatorName: string; note: string }>();
  @Output() clear = new EventEmitter<Alarm>();
  @Output() delete = new EventEmitter<Alarm>();
  @Output() viewEvents = new EventEmitter<number>();

  trackById(_: number, alarm: Alarm): number {
    return alarm.id;
  }

  onAcknowledge(alarm: Alarm, payload: { operatorName: string; note: string }): void {
    this.acknowledge.emit({ alarm, ...payload });
  }

  onClear(alarm: Alarm): void {
    this.clear.emit(alarm);
  }

  onDelete(alarm: Alarm): void {
    this.delete.emit(alarm);
  }
}
