import { Injectable, signal } from '@angular/core';

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  username: string;
  role: UserRole;
  displayName: string;
}

// Hardcoded credentials for demo purposes
const USERS: { username: string; password: string; role: UserRole; displayName: string }[] = [
  { username: 'admin',    password: 'admin123',    role: 'ADMIN',    displayName: 'Administrator' },
  { username: 'operator', password: 'operator123', role: 'OPERATOR', displayName: 'Operator' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'hmi_auth_user';

  private _currentUser = signal<User | null>(this.loadFromStorage());

  get currentUser() {
    return this._currentUser();
  }

  get isLoggedIn(): boolean {
    return this._currentUser() !== null;
  }

  get isAdmin(): boolean {
    return this._currentUser()?.role === 'ADMIN';
  }

  get isOperator(): boolean {
    return this._currentUser()?.role === 'OPERATOR';
  }

  login(username: string, password: string): { success: boolean; error?: string } {
    const match = USERS.find(u => u.username === username && u.password === password);
    if (!match) {
      return { success: false, error: 'Invalid username or password' };
    }
    const user: User = { username: match.username, role: match.role, displayName: match.displayName };
    this._currentUser.set(user);
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    return { success: true };
  }

  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
