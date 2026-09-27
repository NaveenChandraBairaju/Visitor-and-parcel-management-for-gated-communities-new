import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-frequent-visitors',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSnackBarModule
  ],
  templateUrl: './frequent-visitors.component.html',
  styleUrl: './frequent-visitors.component.css'
})
export class FrequentVisitorsComponent implements OnInit {
  frequentVisitors: any[] = [];
  displayedColumns = ['name', 'phone', 'relationship', 'actions'];
  residentId: number = 0;
  isLoading = false;

  newVisitor = {
    name: '',
    phone: '',
    relationship: ''
  };

  relationships = ['Maid', 'Driver', 'Cook', 'Tutor', 'Gardener', 'Other'];

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    this.residentId = userData.id;
    this.loadFrequentVisitors();
  }

  loadFrequentVisitors() {
    if (this.residentId) {
      this.apiService.getFrequentVisitorsByResident(this.residentId).subscribe({
        next: (data) => this.frequentVisitors = data,
        error: (err) => console.error('Error loading frequent visitors:', err)
      });
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '').substring(0, 10);
    this.newVisitor.phone = input.value;
  }

  get isFormValid(): boolean {
    return !!(
      this.newVisitor.name.trim() &&
      this.newVisitor.phone.length === 10 &&
      this.newVisitor.relationship
    );
  }

  addVisitor() {
    if (!this.isFormValid) return;

    this.isLoading = true;
    const data = {
      residentId: this.residentId,
      name: this.newVisitor.name,
      phone: this.newVisitor.phone,
      relationship: this.newVisitor.relationship
    };

    this.apiService.addFrequentVisitor(data).subscribe({
      next: () => {
        this.snackBar.open('Frequent visitor added!', 'Close', { duration: 3000 });
        this.clearForm();
        this.loadFrequentVisitors();
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to add visitor', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  deleteVisitor(id: number) {
    this.apiService.deleteFrequentVisitor(id).subscribe({
      next: () => {
        this.snackBar.open('Visitor removed', 'Close', { duration: 3000 });
        this.loadFrequentVisitors();
      },
      error: () => this.snackBar.open('Failed to remove visitor', 'Close', { duration: 3000 })
    });
  }

  clearForm() {
    this.newVisitor = { name: '', phone: '', relationship: '' };
  }
}
