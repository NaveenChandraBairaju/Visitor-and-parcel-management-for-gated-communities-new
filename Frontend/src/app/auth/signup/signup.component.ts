import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  fullName = '';
  email = '';
  phone = '';
  flatNumber = '';
  role = '';
  password = '';
  confirmPassword = '';
  hidePassword = true;
  hideConfirmPassword = true;
  agreeTerms = false;
  showError = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  get isFormValid(): boolean {
    const baseValid = !!(
      this.fullName.trim() &&
      this.email.trim() &&
      this.isValidEmail(this.email) &&
      this.phone.length === 10 &&
      /^[0-9]{10}$/.test(this.phone) &&
      this.role &&
      this.password.length >= 6 &&
      this.password === this.confirmPassword &&
      this.agreeTerms
    );
    
    if (this.role === 'resident') {
      return baseValid && !!this.flatNumber.trim();
    }
    return baseValid;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '').substring(0, 10);
    this.phone = input.value;
  }

  signup() {
    this.showError = true;
    
    if (!this.fullName.trim()) {
      this.errorMessage = 'Please enter your full name';
      return;
    }
    if (!this.email.trim() || !this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }
    if (this.phone.length !== 10 || !/^[0-9]{10}$/.test(this.phone)) {
      this.errorMessage = 'Phone number must be 10 digits';
      return;
    }
    if (this.role === 'resident' && !this.flatNumber.trim()) {
      this.errorMessage = 'Please enter your flat/unit number';
      return;
    }
    if (!this.role) {
      this.errorMessage = 'Please select a role';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (!this.agreeTerms) {
      this.errorMessage = 'Please agree to the Terms & Conditions';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const signupData = {
      name: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role,
      contactInfo: this.phone,
      flatNumber: this.role === 'resident' ? this.flatNumber.trim() : null
    };

    this.apiService.signup(signupData).subscribe({
      next: () => {
        this.snackBar.open('Registration successful! Please login.', 'Close', { duration: 3000 });
        this.router.navigate(['/login'], { queryParams: { role: this.role } });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
