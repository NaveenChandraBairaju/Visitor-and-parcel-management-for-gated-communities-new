import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-resident-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './resident-home.component.html',
  styleUrl: './resident-home.component.css'
})
export class ResidentHomeComponent implements OnInit {
  userName = 'Resident';
  residentFlat = '';
  pendingVisitors = 0;
  pendingParcels = 0;
  residentId = 0;
  announcements: any[] = [];
  recentVisitors: any[] = [];
  recentParcels: any[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userName = userData.fullName || 'Resident';
    this.residentFlat = userData.flatNumber || '';
    this.residentId = userData.id;
    this.loadStats();
    this.loadAnnouncements();
    this.loadRecentHistory();
  }

  loadStats() {
    if (this.residentId) {
      this.apiService.getPendingVisitors(this.residentId).subscribe({
        next: (data) => this.pendingVisitors = data.length,
        error: () => {}
      });

      this.apiService.getParcelsByResident(this.residentId).subscribe({
        next: (data) => this.pendingParcels = data.filter(p => p.status === 'Received').length,
        error: () => {}
      });
    }
  }

  loadAnnouncements() {
    this.apiService.getAnnouncementsByAudience('Residents').subscribe({
      next: (data) => this.announcements = data.slice(0, 3),
      error: (err) => console.error('Error loading announcements:', err)
    });
  }

  loadRecentHistory() {
    if (this.residentId) {
      this.apiService.getVisitorsByResident(this.residentId).subscribe({
        next: (data) => this.recentVisitors = data.slice(0, 5),
        error: () => {}
      });

      this.apiService.getParcelsByResident(this.residentId).subscribe({
        next: (data) => this.recentParcels = data.slice(0, 5),
        error: () => {}
      });
    }
  }
}
