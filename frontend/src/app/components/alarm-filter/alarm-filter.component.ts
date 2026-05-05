import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlarmFilter, Severity, AlarmState } from '../../models/alarm.model';

@Component({
  selector: 'app-alarm-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Search</label>
        <input
          class="filter-input"
          type="text"
          placeholder="Code or message..."
          [(ngModel)]="draft.keyword"
          (keyup.enter)="applyFilters()"
        />
      </div>

      <div class="filter-group">
        <label class="filter-label">Severity</label>
        <select class="filter-select" [(ngModel)]="draft.severity">
          <option value="">All Severities</option>
          <option *ngFor="let s of severities" [value]="s">{{ s }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">State</label>
        <select class="filter-select" [(ngModel)]="draft.state">
          <option value="">All States</option>
          <option *ngFor="let s of states" [value]="s">{{ s }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Sort By</label>
        <select class="filter-select" [(ngModel)]="draft.sortBy">
          <option value="createdAt">Date Created</option>
          <option value="severity">Severity</option>
          <option value="state">State</option>
          <option value="code">Code</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Direction</label>
        <select class="filter-select" [(ngModel)]="draft.sortDir">
          <option value="DESC">Newest First</option>
          <option value="ASC">Oldest First</option>
        </select>
      </div>

      <div class="filter-actions">
        <button class="btn-apply" (click)="applyFilters()">🔍 Apply</button>
        <button class="btn-reset" (click)="resetFilters()">↺ Reset</button>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      flex-wrap: wrap;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1rem 1.4rem;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .filter-label {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .filter-input, .filter-select {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      min-width: 140px;
      outline: none;
      transition: border-color 0.2s;
    }
    .filter-input:focus, .filter-select:focus {
      border-color: var(--color-accent);
    }
    .filter-actions {
      display: flex;
      gap: 0.5rem;
      align-self: flex-end;
    }
    .btn-apply {
      background: var(--color-accent);
      color: #000;
      border: none;
      border-radius: 8px;
      padding: 0.5rem 1.1rem;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-apply:hover { opacity: 0.85; }
    .btn-reset {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-reset:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  `]
})
export class AlarmFilterComponent implements OnInit {
  @Input() filter!: AlarmFilter;
  @Output() filterChange = new EventEmitter<AlarmFilter>();

  severities: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  states: AlarmState[] = ['ACTIVE', 'ACKNOWLEDGED', 'CLEARED'];

  // Draft holds pending changes until Apply is clicked
  draft: AlarmFilter = {
    severity: '',
    state: '',
    keyword: '',
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'DESC'
  };

  ngOnInit(): void {
    this.draft = { ...this.filter };
  }

  applyFilters(): void {
    this.filter = { ...this.draft, page: 0 };
    this.filterChange.emit({ ...this.filter });
  }

  resetFilters(): void {
    this.draft = {
      ...this.draft,
      severity: '',
      state: '',
      keyword: '',
      sortBy: 'createdAt',
      sortDir: 'DESC',
      page: 0
    };
    this.filter = { ...this.draft };
    this.filterChange.emit({ ...this.filter });
  }
}
