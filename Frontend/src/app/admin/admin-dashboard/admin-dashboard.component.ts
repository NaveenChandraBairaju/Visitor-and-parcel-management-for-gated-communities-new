import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  adminName = 'Admin';
  totalResidents = 0;
  totalVisitors = 0;
  totalParcels = 0;
  activeGuards = 0;
  pendingVisitorApprovals = 0;
  pendingParcelApprovals = 0;
  recentVisitors: any[] = [];
  recentParcels: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStats();
    this.loadRecentHistory();
  }

  loadStats() {
    this.apiService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalResidents = stats.totalUsers;
        this.totalVisitors = stats.totalVisitors;
        this.totalParcels = stats.totalParcels;
        this.pendingVisitorApprovals = stats.pendingVisitors;
        this.pendingParcelApprovals = stats.pendingParcels;
      },
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  loadRecentHistory() {
    this.apiService.getRecentVisitorHistory().subscribe({
      next: (data) => this.recentVisitors = data.slice(0, 5),
      error: (err) => console.error('Error loading visitor history:', err)
    });
    this.apiService.getRecentParcelHistory().subscribe({
      next: (data) => this.recentParcels = data.slice(0, 5),
      error: (err) => console.error('Error loading parcel history:', err)
    });
  }
}
