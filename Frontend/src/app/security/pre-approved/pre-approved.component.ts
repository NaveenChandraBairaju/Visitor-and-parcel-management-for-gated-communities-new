import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-pre-approved',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './pre-approved.component.html',
  styleUrl: './pre-approved.component.css'
})
export class PreApprovedComponent implements OnInit {
  displayedColumns = ['name', 'phone', 'flatNumber', 'purpose', 'expectedDate', 'status', 'actions'];
  historyColumns = ['name', 'phone', 'flatNumber', 'purpose', 'expectedDate', 'status'];
  preApprovedList: any[] = [];
  historyList: any[] = [];

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadPreApproved();
    this.loadHistory();
  }

  loadPreApproved() {
    this.apiService.getAllPreApproved().subscribe({
      next: (data) => this.preApprovedList = data,
      error: (err) => console.error('Error loading pre-approved:', err)
    });
  }

  loadHistory() {
    this.apiService.getPreApprovedHistory().subscribe({
      next: (data) => this.historyList = data.filter(v => v.status === 'Exited').slice(0, 10),
      error: (err) => console.error('Error loading history:', err)
    });
  }

  get todayCount() {
    const today = new Date().toISOString().split('T')[0];
    return this.preApprovedList.filter(v => v.expected_date === today).length;
  }

  allowEntry(visitor: any) {
    this.apiService.updatePreApprovedStatus(visitor.id, 'Inside').subscribe({
      next: () => {
        this.snackBar.open('Entry allowed!', 'Close', { duration: 3000 });
        this.loadPreApproved();
      },
      error: () => this.snackBar.open('Failed to allow entry', 'Close', { duration: 3000 })
    });
  }

  markExit(visitor: any) {
    this.apiService.updatePreApprovedStatus(visitor.id, 'Exited').subscribe({
      next: () => {
        this.snackBar.open('Exit recorded!', 'Close', { duration: 3000 });
        this.loadPreApproved();
        this.loadHistory();
      },
      error: () => this.snackBar.open('Failed to record exit', 'Close', { duration: 3000 })
    });
  }
}
