import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { AlarmSummary } from '../../models/alarm.model';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrapper">
      <h3 class="chart-title">Active vs Cleared</h3>
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
        <div class="chart-center" *ngIf="summary">
          <div class="center-count">{{ summary.activeCount }}</div>
          <div class="center-label">Active</div>
        </div>
      </div>
      <div class="chart-legend">
        <div class="legend-item" *ngFor="let item of legendItems">
          <span class="legend-dot" [style.background]="item.color"></span>
          <span class="legend-name">{{ item.label }}</span>
          <span class="legend-val">{{ item.value }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
    }
    .chart-title {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin: 0 0 1rem 0;
    }
    .chart-container {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto;
    }
    .chart-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }
    .center-count {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--color-critical);
      line-height: 1;
    }
    .center-label {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .chart-legend {
      margin-top: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-name { flex: 1; color: var(--text-secondary); }
    .legend-val { font-weight: 700; color: var(--text-primary); }
  `]
})
export class DonutChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() summary: AlarmSummary | null = null;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  legendItems: { label: string; color: string; value: number }[] = [];

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summary'] && this.chartCanvas) {
      this.buildChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    if (!this.summary || !this.chartCanvas) return;

    const { activeCount, acknowledgedCount, clearedCount } = this.summary;
    const colors = ['#ef4444', '#f59e0b', '#6b7280'];

    this.legendItems = [
      { label: 'Active',       color: colors[0], value: activeCount },
      { label: 'Acknowledged', color: colors[1], value: acknowledgedCount },
      { label: 'Cleared',      color: colors[2], value: clearedCount }
    ];

    if (this.chart) {
      this.chart.data.datasets[0].data = [activeCount, acknowledgedCount, clearedCount];
      this.chart.update();
      return;
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Acknowledged', 'Cleared'],
        datasets: [{
          data: [activeCount, acknowledgedCount, clearedCount],
          backgroundColor: colors,
          borderColor: '#1a1f2e',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        cutout: '72%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}`
            }
          }
        }
      }
    });
  }
}
