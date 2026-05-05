import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">HMI Alarm Board</span>
        <span class="brand-badge">LIVE</span>
      </div>
      <div class="navbar-links">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <span class="nav-icon">📊</span> Dashboard
        </a>
      </div>
      <div class="navbar-right">
        <div class="navbar-status">
          <span class="status-dot"></span>
          <span class="status-text">System Online</span>
        </div>
        <div class="user-info" *ngIf="auth.currentUser">
          <span class="role-badge" [class.role-admin]="auth.isAdmin" [class.role-operator]="auth.isOperator">
            {{ auth.isAdmin ? '🛡 ADMIN' : '👤 OPERATOR' }}
          </span>
          <span class="user-name">{{ auth.currentUser.displayName }}</span>
          <button class="btn-logout" (click)="logout()">↩ Logout</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: 64px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      padding: 0 2rem;
      gap: 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--text-primary);
    }
    .brand-icon { font-size: 1.4rem; }
    .brand-badge {
      background: var(--color-critical);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.1em;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .navbar-links { display: flex; gap: 0.5rem; flex: 1; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      background: var(--bg-hover);
      color: var(--color-accent);
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-left: auto;
    }
    .navbar-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-low);
      animation: pulse 2s infinite;
    }
    .status-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.35rem 0.75rem;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 20px;
    }
    .role-badge {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .role-admin {
      background: rgba(88,166,255,0.15);
      color: var(--color-accent);
      border: 1px solid rgba(88,166,255,0.3);
    }
    .role-operator {
      background: rgba(34,197,94,0.15);
      color: var(--color-low);
      border: 1px solid rgba(34,197,94,0.3);
    }
    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .btn-logout {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      border-radius: 6px;
      padding: 3px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      border-color: var(--color-critical);
      color: var(--color-critical);
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
