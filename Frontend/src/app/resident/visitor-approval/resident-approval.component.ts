import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-resident-approval',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatTableModule, MatIconModule, MatSnackBarModule],
  templateUrl: './resident-approval.component.html',
  styleUrl: './resident-approval.component.css'
})
export class ResidentApprovalComponent implements OnInit {
  displayedColumns = ['name', 'purpose', 'checkIn', 'status', 'actions'];
  visitors: any[] = [];
  residentId: number = 0;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.residentId = userData.id;
    this.loadVisitors();
  }

  loadVisitors() {
    if (this.residentId) {
      this.apiService.getVisitorsByResident(this.residentId).subscribe({
        next: (data) => this.visitors = data,
        error: (err) => console.error('Error loading visitors:', err)
      });
    }
  }

  get waitingCount() { return this.visitors.filter(v => v.status === 'Waiting for Approval' || v.status === 'New').length; }
  get approvedCount() { return this.visitors.filter(v => v.status === 'Approved' || v.status === 'Entered').length; }
  get rejectedCount() { return this.visitors.filter(v => v.status === 'Rejected').length; }

  approveVisitor(visitor: any) {
    this.apiService.updateVisitorStatus(visitor.id, 'Approved').subscribe({
      next: () => {
        this.snackBar.open('Visitor approved!', 'Close', { duration: 3000 });
        this.loadVisitors();
      },
      error: (err) => this.snackBar.open('Failed to approve visitor', 'Close', { duration: 3000 })
    });
  }

  rejectVisitor(visitor: any) {
    this.apiService.updateVisitorStatus(visitor.id, 'Rejected').subscribe({
      next: () => {
        this.snackBar.open('Visitor rejected', 'Close', { duration: 3000 });
        this.loadVisitors();
      },
      error: (err) => this.snackBar.open('Failed to reject visitor', 'Close', { duration: 3000 })
    });
  }
}
