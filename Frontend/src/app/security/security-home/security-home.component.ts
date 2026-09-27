import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-security-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './security-home.component.html',
  styleUrl: './security-home.component.css'
})
export class SecurityHomeComponent implements OnInit {
  userName = 'Security Guard';
  totalVisitors = 0;
  totalParcels = 0;
  pendingApprovals = 0;
  announcements: any[] = [];
  recentVisitors: any[] = [];
  recentParcels: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.userName = userData.fullName || 'Security Guard';
    this.loadStats();
    this.loadAnnouncements();
    this.loadRecentHistory();
  }

  loadStats() {
    this.apiService.getAllVisitors().subscribe({
      next: (data) => {
        this.totalVisitors = data.length;
        this.pendingApprovals = data.filter(v => v.status === 'Waiting for Approval' || v.status === 'New').length;
      },
      error: () => {}
    });

    this.apiService.getAllParcels().subscribe({
      next: (data) => this.totalParcels = data.length,
      error: () => {}
    });
  }

  loadAnnouncements() {
    this.apiService.getAnnouncementsByAudience('Security').subscribe({
      next: (data) => this.announcements = data.slice(0, 3),
      error: (err) => console.error('Error loading announcements:', err)
    });
  }

  loadRecentHistory() {
    this.apiService.getRecentVisitorHistory().subscribe({
      next: (data) => this.recentVisitors = data.slice(0, 5),
      error: () => {}
    });

    this.apiService.getRecentParcelHistory().subscribe({
      next: (data) => this.recentParcels = data.slice(0, 5),
      error: () => {}
    });
  }
}
