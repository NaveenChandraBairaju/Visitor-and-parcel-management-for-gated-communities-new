import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-security-frequent-visitors',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './frequent-visitors.component.html',
  styleUrl: './frequent-visitors.component.css'
})
export class SecurityFrequentVisitorsComponent implements OnInit {
  allVisitors: any[] = [];
  filteredVisitors: any[] = [];
  displayedColumns = ['name', 'phone', 'relationship', 'resident', 'actions'];
  searchQuery = '';

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadFrequentVisitors();
  }

  loadFrequentVisitors() {
    this.apiService.getAllFrequentVisitors().subscribe({
      next: (data) => {
        this.allVisitors = data;
        this.filteredVisitors = data;
      },
      error: (err) => console.error('Error loading frequent visitors:', err)
    });
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredVisitors = this.allVisitors;
    } else {
      this.filteredVisitors = this.allVisitors.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.phone.includes(query)
      );
    }
  }

  checkIn(visitor: any) {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    const visitorData = {
      residentId: visitor.resident_id,
      securityGuardId: userData.id,
      name: visitor.name,
      phone: visitor.phone,
      purpose: visitor.relationship,
      vehicleDetails: null,
      isFrequent: true  // Flag to mark as frequent visitor - direct entry
    };

    this.apiService.logVisitor(visitorData).subscribe({
      next: () => {
        this.snackBar.open(`${visitor.name} checked in successfully!`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to check in visitor', 'Close', { duration: 3000 });
      }
    });
  }
}
