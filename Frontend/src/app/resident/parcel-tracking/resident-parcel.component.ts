import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-resident-parcel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './resident-parcel.component.html',
  styleUrls: ['./resident-parcel.component.css']
})
export class ResidentParcelComponent implements OnInit {
  displayedColumns = ['courier', 'name', 'receivedDate', 'status', 'actions'];
  parcels: any[] = [];
  recentHistory: any[] = [];
  residentId: number = 0;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.residentId = userData.id;
    this.loadParcels();
    this.loadRecentHistory();
  }

  loadParcels() {
    if (this.residentId) {
      this.apiService.getParcelsByResident(this.residentId).subscribe({
        next: (data) => this.parcels = data,
        error: (err) => console.error('Error loading parcels:', err)
      });
    }
  }

  loadRecentHistory() {
    if (this.residentId) {
      this.apiService.getParcelsByResident(this.residentId).subscribe({
        next: (data) => this.recentHistory = data.filter(p => p.status === 'Exited' || p.status === 'Collected').slice(0, 5),
        error: (err) => console.error('Error loading history:', err)
      });
    }
  }

  get pendingCount() { return this.parcels.filter(p => p.status === 'Received').length; }
  get acknowledgedCount() { return this.parcels.filter(p => p.status === 'Acknowledged').length; }
  get enteredCount() { return this.parcels.filter(p => p.status === 'Entered').length; }
  get exitedCount() { return this.parcels.filter(p => p.status === 'Exited' || p.status === 'Collected').length; }

  acknowledgeParcel(parcel: any) {
    this.apiService.updateParcelStatus(parcel.id, 'Acknowledged').subscribe({
      next: () => {
        this.snackBar.open('Parcel acknowledged! Please collect from security.', 'Close', { duration: 3000 });
        this.loadParcels();
      },
      error: () => this.snackBar.open('Failed to acknowledge parcel', 'Close', { duration: 3000 })
    });
  }

  collectParcel(parcel: any) {
    this.apiService.updateParcelStatus(parcel.id, 'Collected').subscribe({
      next: () => {
        this.snackBar.open('Parcel collected successfully!', 'Close', { duration: 3000 });
        this.loadParcels();
        this.loadRecentHistory();
      },
      error: () => this.snackBar.open('Failed to collect parcel', 'Close', { duration: 3000 })
    });
  }
}
