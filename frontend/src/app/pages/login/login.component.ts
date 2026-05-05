import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-bg">
      <div class="login-card">

        <!-- Header -->
        <div class="login-header">
          <div class="brand">
            <span class="brand-icon">⚡</span>
            <span class="brand-name">HMI Alarm Board</span>
          </div>
          <div class="login-badge">SECURE ACCESS</div>
          <p class="login-subtitle">Sign in to continue to the alarm management system</p>
        </div>

        <!-- Role Quick Select -->
        <div class="role-tabs">
          <button
            class="role-tab"
            [class.active]="selectedRole === 'admin'"
            (click)="fillDemo('admin')"
          >
            <span class="role-icon">🛡</span>
            <span>Admin</span>
          </button>
          <button
            class="role-tab"
            [class.active]="selectedRole === 'operator'"
            (click)="fillDemo('operator')"
          >
            <span class="role-icon">👤</span>
            <span>Operator</span>
          </button>
        </div>

        <!-- Form -->
        <div class="login-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input
              class="form-input"
              type="text"
              [(ngModel)]="username"
              placeholder="Enter username"
              (keyup.enter)="onLogin()"
              autocomplete="username"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="password-wrapper">
              <input
                class="form-input"
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                placeholder="Enter password"
                (keyup.enter)="onLogin()"
                autocomplete="current-password"
              />
              <button class="toggle-pw" (click)="showPassword = !showPassword" type="button">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="form-error" *ngIf="errorMsg">
            <span>⚠</span> {{ errorMsg }}
          </div>

          <button
            class="btn-login"
            (click)="onLogin()"
            [disabled]="loading"
          >
            <span *ngIf="!loading">Sign In →</span>
            <span *ngIf="loading">Signing in...</span>
          </button>
        </div>

        <!-- Demo Credentials -->
        <div class="demo-info">
          <div class="demo-title">Demo Credentials</div>
          <div class="demo-row">
            <span class="demo-role admin-tag">ADMIN</span>
            <code>admin / admin123</code>
            <span class="demo-perms">Full access</span>
          </div>
          <div class="demo-row">
            <span class="demo-role operator-tag">OPERATOR</span>
            <code>operator / operator123</code>
            <span class="demo-perms">No create/delete</span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .login-bg {
      min-height: 100vh;
      background: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(88,166,255,0.04) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(239,68,68,0.04) 0%, transparent 50%);
    }

    .login-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .login-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .brand-icon { font-size: 1.8rem; }

    .login-badge {
      display: inline-block;
      background: rgba(88,166,255,0.1);
      border: 1px solid rgba(88,166,255,0.3);
      color: var(--color-accent);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      padding: 3px 10px;
      border-radius: 20px;
      align-self: center;
    }

    .login-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Role Tabs */
    .role-tabs {
      display: flex;
      gap: 0.75rem;
    }

    .role-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      padding: 0.75rem;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .role-tab .role-icon { font-size: 1.25rem; }

    .role-tab:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .role-tab.active {
      background: rgba(88,166,255,0.1);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    .password-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-primary);
      padding: 0.7rem 0.9rem;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: var(--font-sans);
    }

    .form-input:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(88,166,255,0.1);
    }

    .toggle-pw {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px;
      border-radius: 4px;
    }

    .form-error {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.4);
      border-radius: 8px;
      padding: 0.6rem 0.9rem;
      color: var(--color-critical);
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-login {
      width: 100%;
      background: var(--color-accent);
      color: #000;
      border: none;
      border-radius: 10px;
      padding: 0.8rem;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
      margin-top: 0.25rem;
    }

    .btn-login:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-login:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Demo info */
    .demo-info {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .demo-title {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 2px;
    }

    .demo-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
    }

    .demo-row code {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--text-secondary);
      flex: 1;
    }

    .demo-perms {
      font-size: 0.7rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .demo-role {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .admin-tag {
      background: rgba(88,166,255,0.15);
      color: var(--color-accent);
      border: 1px solid rgba(88,166,255,0.3);
    }

    .operator-tag {
      background: rgba(34,197,94,0.15);
      color: var(--color-low);
      border: 1px solid rgba(34,197,94,0.3);
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMsg = '';
  loading = false;
  showPassword = false;
  selectedRole: 'admin' | 'operator' | '' = '';

  fillDemo(role: 'admin' | 'operator'): void {
    this.selectedRole = role;
    if (role === 'admin') {
      this.username = 'admin';
      this.password = 'admin123';
    } else {
      this.username = 'operator';
      this.password = 'operator123';
    }
    this.errorMsg = '';
  }

  onLogin(): void {
    this.errorMsg = '';
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMsg = 'Please enter username and password';
      return;
    }
    this.loading = true;
    // Simulate slight delay for UX
    setTimeout(() => {
      const result = this.auth.login(this.username.trim(), this.password);
      this.loading = false;
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg = result.error || 'Login failed';
      }
    }, 400);
  }
}
