import { Component, OnInit, NgZone } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  role = 'resident';
  hidePassword = true;
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.role = params['role'];
      }
    });

    // Initialize Google Sign-In
    this.initGoogleSignIn();
  }

  initGoogleSignIn() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: '108946964772-lk97j94o20ifqd93s3hub9jug1niq8lo.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleSignIn(response)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
      );
    }
  }

  handleGoogleSignIn(response: any) {
    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));

    this.ngZone.run(() => {
      this.apiService.googleLogin(payload.email, payload.name, payload.sub).subscribe({
        next: (res) => {
          const user = res.user;
          
          // Check if user role matches selected portal
          if (user.role !== this.role) {
            this.errorMessage = `This Google account is registered as ${user.role}. Please use the ${user.role} portal.`;
            this.snackBar.open(`Access denied. Use ${user.role} portal.`, 'Close', { duration: 4000 });
            return;
          }
          
          this.setUserAndNavigate({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            flatNumber: user.flatNumber || '',
            role: user.role,
            contactInfo: user.contactInfo
          });
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.snackBar.open(err.error?.error || 'Google login failed', 'Close', { duration: 3000 });
        }
      });
    });
  }

  getBrandIcon(): string {
    switch (this.role) {
      case 'resident': return 'home';
      case 'security': return 'shield';
      case 'admin': return 'admin_panel_settings';
      default: return 'shield';
    }
  }

  getBrandName(): string {
    switch (this.role) {
      case 'resident': return 'Resident Portal';
      case 'security': return 'Security Portal';
      case 'admin': return 'Admin Portal';
      default: return 'SecureGate';
    }
  }

  getWelcomeText(): string {
    switch (this.role) {
      case 'resident': return 'Welcome Home!';
      case 'security': return 'Guard Station';
      case 'admin': return 'Admin Access';
      default: return 'Welcome Back!';
    }
  }

  getSubText(): string {
    switch (this.role) {
      case 'resident': return 'Manage your visitors and parcels';
      case 'security': return 'Secure the community entrance';
      case 'admin': return 'Manage the entire community';
      default: return 'Sign in to access your portal';
    }
  }

  getRightIcon(): string {
    switch (this.role) {
      case 'resident': return 'family_restroom';
      case 'security': return 'verified_user';
      case 'admin': return 'settings';
      default: return 'verified_user';
    }
  }

  getRightTitle(): string {
    switch (this.role) {
      case 'resident': return 'Your Home, Your Control';
      case 'security': return 'Protect & Serve';
      case 'admin': return 'Full Control';
      default: return 'Secure Access';
    }
  }

  getRightText(): string {
    switch (this.role) {
      case 'resident': return 'Approve visitors and track parcels from anywhere';
      case 'security': return 'Keep the community safe and secure';
      case 'admin': return 'Monitor and manage all community operations';
      default: return 'Your community\'s safety is our priority';
    }
  }

  login() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.isLoading = true;

    this.apiService.login(this.email, this.password).subscribe({
      next: (response) => {
        const user = response.user;
        
        if (user.role !== this.role) {
          this.errorMessage = `Invalid credentials. This account is for ${user.role} portal.`;
          this.isLoading = false;
          return;
        }

        const userData = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          flatNumber: user.flatNumber || '',
          role: user.role,
          contactInfo: user.contactInfo
        };

        this.setUserAndNavigate(userData);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Login failed. Please try again.';
      }
    });
  }

  private setUserAndNavigate(userData: any) {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('userName', userData.fullName);
    localStorage.setItem('userFlat', userData.flatNumber);
    localStorage.setItem('userData', JSON.stringify(userData));

    this.authService.refreshUser();

    switch (userData.role) {
      case 'resident':
        this.router.navigate(['/resident']);
        break;
      case 'security':
        this.router.navigate(['/security']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
