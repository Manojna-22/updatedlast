import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmSummary } from '../../models/alarm.model';

@Component({
  selector: 'app-severity-legend',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="legend-grid" *ngIf="summary">
      <div class="legend-card critical">
        <div class="legend-label">CRITICAL</div>
        <div class="legend-count">{{ summary.activeCritical }}</div>
        <div class="legend-sub">active</div>
      </div>
      <div class="legend-card high">
        <div class="legend-label">HIGH</div>
        <div class="legend-count">{{ summary.activeHigh }}</div>
        <div class="legend-sub">active</div>
      </div>
      <div class="legend-card medium">
        <div class="legend-label">MEDIUM</div>
        <div class="legend-count">{{ summary.activeMedium }}</div>
        <div class="legend-sub">active</div>
      </div>
      <div class="legend-card low">
        <div class="legend-label">LOW</div>
        <div class="legend-count">{{ summary.activeLow }}</div>
        <div class="legend-sub">active</div>
      </div>
      <div class="legend-card total">
        <div class="legend-label">TOTAL</div>
        <div class="legend-count">{{ summary.totalAlarms }}</div>
        <div class="legend-sub">all alarms</div>
      </div>
      <div class="legend-card acked">
        <div class="legend-label">ACKNOWLEDGED</div>
        <div class="legend-count">{{ summary.acknowledgedCount }}</div>
        <div class="legend-sub">pending</div>
      </div>
      <div class="legend-card cleared">
        <div class="legend-label">CLEARED</div>
        <div class="legend-count">{{ summary.clearedCount }}</div>
        <div class="legend-sub">resolved</div>
      </div>
    </div>
    <div class="legend-skeleton" *ngIf="!summary">
      <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6,7]"></div>
    </div>
  `,
  styles: [`
    .legend-grid {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .legend-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1rem 1.4rem;
      min-width: 110px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .legend-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .legend-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin-bottom: 0.4rem;
    }
    .legend-count {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .legend-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 0.2rem;
    }
    .critical { border-top: 3px solid var(--color-critical); }
    .critical .legend-label { color: var(--color-critical); }
    .critical .legend-count { color: var(--color-critical); }
    .high { border-top: 3px solid var(--color-high); }
    .high .legend-label { color: var(--color-high); }
    .high .legend-count { color: var(--color-high); }
    .medium { border-top: 3px solid var(--color-medium); }
    .medium .legend-label { color: var(--color-medium); }
    .medium .legend-count { color: var(--color-medium); }
    .low { border-top: 3px solid var(--color-low); }
    .low .legend-label { color: var(--color-low); }
    .low .legend-count { color: var(--color-low); }
    .total { border-top: 3px solid var(--color-accent); }
    .total .legend-label { color: var(--color-accent); }
    .total .legend-count { color: var(--color-accent); }
    .acked { border-top: 3px solid var(--color-medium); }
    .acked .legend-label { color: var(--color-medium); }
    .acked .legend-count { color: var(--color-medium); }
    .cleared { border-top: 3px solid var(--text-muted); }
    .cleared .legend-label { color: var(--text-muted); }
    .cleared .legend-count { color: var(--text-muted); }
    .legend-skeleton { display: flex; gap: 1rem; }
    .skeleton-card {
      min-width: 110px;
      height: 90px;
      background: var(--bg-secondary);
      border-radius: 12px;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
  `]
})
export class SeverityLegendComponent {
  @Input() summary: AlarmSummary | null = null;
}
