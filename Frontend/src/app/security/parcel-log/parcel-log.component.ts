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
  selector: 'app-parcel-log',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCardModule, MatSelectModule, MatTableModule, 
    MatIconModule, MatSnackBarModule
  ],
  templateUrl: './parcel-log.component.html',
  styleUrl: './parcel-log.component.css'
})
export class ParcelLogComponent implements OnInit {
  parcel = { 
    courier: '', 
    name: '', 
    residentId: 0, 
    description: ''
  };
  displayedColumns = ['courier', 'name', 'flatNumber', 'receivedTime', 'deliveryStatus'];
  recentParcels: any[] = [];
  residents: any[] = [];
  showError = false;
  isLoading = false;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadResidents();
    this.loadRecentParcels();
  }

  loadResidents() {
    this.apiService.getResidents().subscribe({
      next: (data) => this.residents = data,
      error: (err) => console.error('Error loading residents:', err)
    });
  }

  loadRecentParcels() {
    this.apiService.getAllParcels().subscribe({
      next: (data) => this.recentParcels = data.slice(0, 10),
      error: (err) => console.error('Error loading parcels:', err)
    });
  }

  get isFormValid(): boolean {
    return !!(
      this.parcel.courier && 
      this.parcel.name.trim() && 
      this.parcel.residentId
    );
  }

  submitParcel() {
    if (!this.isFormValid) {
      this.showError = true;
      return;
    }

    this.isLoading = true;
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const parcelData = {
      residentId: this.parcel.residentId,
      securityGuardId: userData.id,
      name: `${this.parcel.courier} - ${this.parcel.name}`,
      description: this.parcel.description || null
    };

    this.apiService.logParcel(parcelData).subscribe({
      next: () => {
        this.snackBar.open('Parcel logged successfully!', 'Close', { duration: 3000 });
        this.clearForm();
        this.loadRecentParcels();
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to log parcel', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  clearForm() {
    this.parcel = { 
      courier: '', 
      name: '', 
      residentId: 0, 
      description: ''
    };
    this.showError = false;
  }
}
