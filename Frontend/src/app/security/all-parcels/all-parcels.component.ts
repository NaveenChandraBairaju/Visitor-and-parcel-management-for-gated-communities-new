import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-all-parcels',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, 
    MatTableModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule
  ],
  templateUrl: './all-parcels.component.html',
  styleUrls: ['./all-parcels.component.css']
})
export class AllParcelsComponent implements OnInit {
  displayedColumns = ['courier', 'name', 'flatNumber', 'receivedDate', 'exitTime', 'status', 'actions'];
  parcels: any[] = [];
  recentHistory: any[] = [];
  searchQuery = '';
  statusFilter = 'all';

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadParcels();
    this.loadRecentHistory();
  }

  loadParcels() {
    this.apiService.getAllParcels().subscribe({
      next: (data) => this.parcels = data,
      error: (err) => console.error('Error loading parcels:', err)
    });
  }

  loadRecentHistory() {
    this.apiService.getRecentParcelHistory().subscribe({
      next: (data) => this.recentHistory = data,
      error: (err) => console.error('Error loading history:', err)
    });
  }

  get filteredParcels() {
    let result = this.parcels;
    
    if (this.statusFilter !== 'all') {
      result = result.filter(p => p.status === this.statusFilter);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.flat_number && p.flat_number.toLowerCase().includes(query)) ||
        (p.resident_name && p.resident_name.toLowerCase().includes(query))
      );
    }
    
    return result;
  }

  get receivedCount() { return this.parcels.filter(p => p.status === 'Received').length; }
  get acknowledgedCount() { return this.parcels.filter(p => p.status === 'Acknowledged').length; }
  get enteredCount() { return this.parcels.filter(p => p.status === 'Entered').length; }
  get exitedCount() { return this.parcels.filter(p => p.status === 'Exited' || p.status === 'Collected').length; }
  get totalCount() { return this.parcels.length; }

  markEntered(parcel: any) {
    this.apiService.updateParcelStatus(parcel.id, 'Entered').subscribe({
      next: () => {
        this.snackBar.open('Parcel marked as entered', 'Close', { duration: 3000 });
        this.loadParcels();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  markExited(parcel: any) {
    this.apiService.updateParcelStatus(parcel.id, 'Exited').subscribe({
      next: () => {
        this.snackBar.open('Parcel marked as exited/collected', 'Close', { duration: 3000 });
        this.loadParcels();
        this.loadRecentHistory();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }
}
