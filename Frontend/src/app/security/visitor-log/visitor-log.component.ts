import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-visitor-log',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCardModule, MatSelectModule, MatTableModule, 
    MatIconModule, MatSnackBarModule
  ],
  templateUrl: './visitor-log.component.html',
  styleUrls: ['./visitor-log.component.css']
})
export class VisitorLogComponent implements OnInit {
  visitor = { name: '', phone: '', purpose: '', residentId: 0, vehicleNumber: '' };
  displayedColumns = ['name', 'phone', 'purpose', 'flatNumber', 'checkIn'];
  recentVisitors: any[] = [];
  residents: any[] = [];
  showError = false;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadResidents();
    this.loadRecentVisitors();
  }

  loadResidents() {
    this.apiService.getResidents().subscribe({
      next: (data) => this.residents = data,
      error: (err) => console.error('Error loading residents:', err)
    });
  }

  loadRecentVisitors() {
    this.apiService.getAllVisitors().subscribe({
      next: (data) => this.recentVisitors = data.slice(0, 10),
      error: (err) => console.error('Error loading visitors:', err)
    });
  }

  get isFormValid(): boolean {
    return !!(
      this.visitor.name.trim() && 
      this.visitor.phone.length === 10 && 
      /^[0-9]{10}$/.test(this.visitor.phone) &&
      this.visitor.purpose &&
      this.visitor.residentId
    );
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '').substring(0, 10);
    this.visitor.phone = input.value;
  }

  submitVisitor() {
    if (!this.isFormValid) {
      this.showError = true;
      return;
    }

    this.isLoading = true;
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const visitorData = {
      residentId: this.visitor.residentId,
      securityGuardId: userData.id,
      name: this.visitor.name,
      phone: this.visitor.phone,
      purpose: this.visitor.purpose,
      vehicleDetails: this.visitor.vehicleNumber || null
    };

    this.apiService.logVisitor(visitorData).subscribe({
      next: () => {
        this.snackBar.open('Visitor logged successfully!', 'Close', { duration: 3000 });
        this.clearForm();
        this.loadRecentVisitors();
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to log visitor', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  clearForm() {
    this.visitor = { name: '', phone: '', purpose: '', residentId: 0, vehicleNumber: '' };
    this.showError = false;
  }
}
