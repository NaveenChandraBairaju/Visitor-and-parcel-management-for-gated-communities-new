import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-resident-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule],
  templateUrl: './resident-layout.component.html',
  styleUrl: './resident-layout.component.css'
})
export class ResidentLayoutComponent implements OnInit, OnDestroy {
  notificationCount = 0;
  notifications: any[] = [];
  private intervalId: any;
  private residentId = 0;

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.residentId = userData.id;
    this.loadNotifications();
    this.intervalId = setInterval(() => this.loadNotifications(), 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  loadNotifications() {
    if (!this.residentId) return;

    this.apiService.getPendingVisitors(this.residentId).subscribe({
      next: (visitors) => {
        const visitorNotifs = visitors.map(v => ({
          id: v.id,
          type: 'visitor',
          title: `${v.name} waiting for approval`,
          time: 'Just now',
          route: '/resident/visitor-approval'
        }));

        this.apiService.getParcelsByResident(this.residentId).subscribe({
          next: (parcels) => {
            const parcelNotifs = parcels
              .filter(p => p.status === 'Received')
              .map(p => ({
                id: p.id,
                type: 'parcel',
                title: `Parcel from ${p.name} arrived`,
                time: 'Just now',
                route: '/resident/parcel-tracking'
              }));

            this.notifications = [...visitorNotifs, ...parcelNotifs];
            this.notificationCount = this.notifications.length;
          }
        });
      }
    });
  }

  goToNotification(notif: any) {
    this.router.navigate([notif.route]);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
