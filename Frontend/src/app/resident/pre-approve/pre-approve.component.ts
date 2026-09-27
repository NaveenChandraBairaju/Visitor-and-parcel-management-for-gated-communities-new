import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-pre-approve',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatTableModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule
  ],
  templateUrl: './pre-approve.component.html',
  styleUrls: ['./pre-approve.component.css']
})
export class PreApproveComponent implements OnInit {
  visitor = { name: '', phone: '', purpose: '', expectedDate: null as Date | null, vehicleNumber: '' };
  displayedColumns = ['name', 'phone', 'purpose', 'expectedDate', 'status', 'actions'];
  preApprovedList: any[] = [];
  showError = false;
  isLoading = false;
  residentId = 0;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.residentId = userData.id;
    this.loadPreApproved();
  }

  loadPreApproved() {
    if (this.residentId) {
      this.apiService.getPreApprovedByResident(this.residentId).subscribe({
        next: (data) => this.preApprovedList = data,
        error: (err) => console.error('Error loading pre-approved:', err)
      });
    }
  }

  get isFormValid(): boolean {
    return !!(
      this.visitor.name.trim() &&
      this.visitor.phone.length === 10 &&
      /^[0-9]{10}$/.test(this.visitor.phone) &&
      this.visitor.purpose &&
      this.visitor.expectedDate
    );
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '').substring(0, 10);
    this.visitor.phone = input.value;
  }

  submitPreApproval() {
    if (!this.isFormValid) {
      this.showError = true;
      return;
    }

    this.isLoading = true;
    const expectedDate = this.visitor.expectedDate 
      ? new Date(this.visitor.expectedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    this.apiService.addPreApproved({
      residentId: this.residentId,
      name: this.visitor.name,
      phone: this.visitor.phone,
      purpose: this.visitor.purpose,
      expectedDate: expectedDate,
      vehicleNumber: this.visitor.vehicleNumber || null
    }).subscribe({
      next: () => {
        this.snackBar.open('Pre-approval added successfully!', 'Close', { duration: 3000 });
        this.clearForm();
        this.loadPreApproved();
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to add pre-approval', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  clearForm() {
    this.visitor = { name: '', phone: '', purpose: '', expectedDate: null, vehicleNumber: '' };
    this.showError = false;
  }

  cancelApproval(item: any) {
    this.apiService.updatePreApprovedStatus(item.id, 'Cancelled').subscribe({
      next: () => {
        this.snackBar.open('Pre-approval cancelled', 'Close', { duration: 3000 });
        this.loadPreApproved();
      },
      error: () => this.snackBar.open('Failed to cancel', 'Close', { duration: 3000 })
    });
  }
}
