import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface User {
  fullName: string;
  email?: string;
  phone?: string;
  flatNumber: string;
  role: 'resident' | 'security' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadUser();
    }
  }

  private loadUser() {
    if (!this.isBrowser) return;
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.currentUser.next(JSON.parse(userData));
    }
  }

  getUser(): User | null {
    return this.currentUser.value;
  }

  getUserFlat(): string {
    if (!this.isBrowser) return 'A-101';
    return this.currentUser.value?.flatNumber || localStorage.getItem('userFlat') || 'A-101';
  }

  getUserName(): string {
    if (!this.isBrowser) return 'User';
    return this.currentUser.value?.fullName || localStorage.getItem('userName') || 'User';
  }

  getUserRole(): string {
    if (!this.isBrowser) return 'resident';
    if (!this.currentUser.value && localStorage.getItem('userData')) {
      this.loadUser();
    }
    return this.currentUser.value?.role || localStorage.getItem('userRole') || 'resident';
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  refreshUser(): void {
    if (this.isBrowser) {
      this.loadUser();
    }
  }

  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFlat');
    localStorage.removeItem('userData');
    this.currentUser.next(null);
  }
}
