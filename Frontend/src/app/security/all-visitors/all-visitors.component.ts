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
  selector: 'app-all-visitors',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, 
    MatTableModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule
  ],
  templateUrl: './all-visitors.component.html',
  styleUrls: ['./all-visitors.component.css']
})
export class AllVisitorsComponent implements OnInit {
  displayedColumns = ['name', 'phone', 'purpose', 'flatNumber', 'checkIn', 'exitTime', 'status', 'actions'];
  visitors: any[] = [];
  recentHistory: any[] = [];
  searchQuery = '';
  statusFilter = 'all';

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadVisitors();
    this.loadRecentHistory();
  }

  loadVisitors() {
    this.apiService.getAllVisitors().subscribe({
      next: (data) => this.visitors = data,
      error: (err) => console.error('Error loading visitors:', err)
    });
  }

  loadRecentHistory() {
    this.apiService.getRecentVisitorHistory().subscribe({
      next: (data) => this.recentHistory = data,
      error: (err) => console.error('Error loading history:', err)
    });
  }

  get filteredVisitors() {
    let result = this.visitors;
    
    if (this.statusFilter !== 'all') {
      result = result.filter(v => v.status === this.statusFilter);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(query) ||
        (v.flat_number && v.flat_number.toLowerCase().includes(query))
      );
    }
    
    return result;
  }

  get waitingCount() { return this.visitors.filter(v => v.status === 'Waiting for Approval' || v.status === 'New').length; }
  get approvedCount() { return this.visitors.filter(v => v.status === 'Approved').length; }
  get enteredCount() { return this.visitors.filter(v => v.status === 'Entered').length; }
  get exitedCount() { return this.visitors.filter(v => v.status === 'Exited').length; }
  get rejectedCount() { return this.visitors.filter(v => v.status === 'Rejected').length; }

  markEntered(visitor: any) {
    this.apiService.updateVisitorStatus(visitor.id, 'Entered').subscribe({
      next: () => {
        this.snackBar.open('Visitor marked as entered', 'Close', { duration: 3000 });
        this.loadVisitors();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  markExited(visitor: any) {
    this.apiService.updateVisitorStatus(visitor.id, 'Exited').subscribe({
      next: () => {
        this.snackBar.open('Visitor marked as exited', 'Close', { duration: 3000 });
        this.loadVisitors();
        this.loadRecentHistory();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }
}
