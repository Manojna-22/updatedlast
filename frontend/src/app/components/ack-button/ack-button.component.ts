import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alarm } from '../../models/alarm.model';

@Component({
  selector: 'app-ack-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Inline action buttons -->
    <div class="action-buttons" *ngIf="!showAckForm">
      <button
        *ngIf="alarm.state === 'ACTIVE'"
        class="btn btn-acknowledge"
        (click)="openAckForm()"
        title="Acknowledge alarm"
      >
        ✓ ACK
      </button>
      <button
        *ngIf="alarm.state !== 'CLEARED'"
        class="btn btn-clear"
        (click)="onClear()"
        title="Clear alarm"
      >
        ✕ Clear
      </button>
      <button
        class="btn btn-events"
        (click)="viewEvents.emit(alarm.id)"
        title="View event history"
      >
        📋
      </button>
      <!-- Delete only shown for ADMIN role, and only when alarm is not ACTIVE -->
      <button
        *ngIf="isAdmin && alarm.state !== 'ACTIVE'"
        class="btn btn-delete"
        (click)="onDelete()"
        title="Delete alarm"
      >
        🗑
      </button>
    </div>

    <!-- Acknowledge Form (inline) -->
    <div class="ack-form" *ngIf="showAckForm">
      <input
        class="ack-input"
        type="text"
        placeholder="Your name *"
        [(ngModel)]="operatorName"
      />
      <input
        class="ack-input"
        type="text"
        placeholder="Note (optional)"
        [(ngModel)]="note"
      />
      <div class="ack-actions">
        <button class="btn btn-confirm" (click)="submitAck()" [disabled]="!operatorName.trim()">
          Confirm
        </button>
        <button class="btn btn-cancel" (click)="cancelAck()">Cancel</button>
      </div>
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 0.4rem;
      align-items: center;
    }
    .btn {
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn:hover { opacity: 0.85; transform: scale(1.05); }
    .btn-acknowledge { background: var(--color-medium); color: #000; }
    .btn-clear { background: var(--color-low); color: #000; }
    .btn-events { background: var(--bg-hover); color: var(--text-primary); padding: 4px 8px; }
    .btn-delete { background: transparent; color: var(--color-critical); border: 1px solid var(--color-critical); padding: 4px 8px; }
    .ack-form {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 220px;
    }
    .ack-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      padding: 0.35rem 0.6rem;
      font-size: 0.8rem;
      outline: none;
    }
    .ack-input:focus { border-color: var(--color-accent); }
    .ack-actions { display: flex; gap: 0.4rem; }
    .btn-confirm {
      background: var(--color-accent);
      color: #000;
      flex: 1;
    }
    .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-cancel {
      background: var(--bg-hover);
      color: var(--text-secondary);
      flex: 1;
    }
  `]
})
export class AckButtonComponent {
  @Input() alarm!: Alarm;
  @Input() isAdmin = false;
  @Output() acknowledge = new EventEmitter<{ operatorName: string; note: string }>();
  @Output() clear = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() viewEvents = new EventEmitter<number>();

  showAckForm = false;
  operatorName = '';
  note = '';

  openAckForm(): void {
    this.showAckForm = true;
    this.operatorName = '';
    this.note = '';
  }

  cancelAck(): void {
    this.showAckForm = false;
  }

  submitAck(): void {
    if (!this.operatorName.trim()) return;
    this.acknowledge.emit({ operatorName: this.operatorName.trim(), note: this.note.trim() });
    this.showAckForm = false;
  }

  onClear(): void {
    this.clear.emit();
  }

  onDelete(): void {
    if (confirm(`Delete alarm ${this.alarm.code}? This cannot be undone.`)) {
      this.delete.emit();
    }
  }
}
