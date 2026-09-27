import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatSnackBarModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  step = 1; // 1=email, 2=otp, 3=password, 4=success
  hidePassword = true;
  resendTimer = 0;
  timerInterval: any;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {}

  sendOTP() {
    if (!this.email) {
      this.snackBar.open('Please enter your email', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.http.post('http://localhost:3000/api/auth/send-otp', { email: this.email })
      .subscribe({
        next: () => {
          this.step = 2;
          this.isLoading = false;
          this.startResendTimer();
          this.snackBar.open('OTP sent to your email!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error?.error || 'Failed to send OTP', 'Close', { duration: 3000 });
        }
      });
  }

  startResendTimer() {
    this.resendTimer = 60;
    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  resendOTP() {
    if (this.resendTimer > 0) return;
    this.sendOTP();
  }

  verifyOTP() {
    if (!this.otp || this.otp.length !== 6) {
      this.snackBar.open('Please enter 6-digit OTP', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.http.post('http://localhost:3000/api/auth/verify-otp', { email: this.email, otp: this.otp })
      .subscribe({
        next: () => {
          this.step = 3;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error?.error || 'Invalid OTP', 'Close', { duration: 3000 });
        }
      });
  }

  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    if (this.newPassword.length < 6) {
      this.snackBar.open('Password must be at least 6 characters', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.http.post('http://localhost:3000/api/auth/reset-password', {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.step = 4;
        this.isLoading = false;
        this.snackBar.open('Password reset successful!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to reset password', 'Close', { duration: 3000 });
      }
    });
  }

  onOtpInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '').substring(0, 6);
    this.otp = input.value;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
