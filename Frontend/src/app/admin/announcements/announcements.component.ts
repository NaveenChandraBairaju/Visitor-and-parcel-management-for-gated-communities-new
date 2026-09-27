import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css'
})
export class AnnouncementsComponent implements OnInit {
  announcement = { title: '', message: '', priority: 'normal', audience: 'All' };
  announcements: any[] = [];
  showError = false;
  isLoading = false;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadAnnouncements();
  }

  loadAnnouncements() {
    this.apiService.getAllAnnouncements().subscribe({
      next: (data) => this.announcements = data,
      error: (err) => console.error('Error loading announcements:', err)
    });
  }

  get highPriorityCount() {
    return this.announcements.filter(a => a.priority === 'high').length;
  }

  get totalCount() {
    return this.announcements.length;
  }

  get isFormValid() {
    return this.announcement.title.trim() && this.announcement.message.trim();
  }

  submitAnnouncement() {
    if (!this.isFormValid) {
      this.showError = true;
      return;
    }

    this.isLoading = true;
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    this.apiService.createAnnouncement({
      title: this.announcement.title.trim(),
      message: this.announcement.message.trim(),
      priority: this.announcement.priority,
      audience: this.announcement.audience,
      createdBy: userData.id
    }).subscribe({
      next: () => {
        this.snackBar.open('Announcement created!', 'Close', { duration: 3000 });
        this.clearForm();
        this.loadAnnouncements();
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to create announcement', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  clearForm() {
    this.announcement = { title: '', message: '', priority: 'normal', audience: 'All' };
    this.showError = false;
  }

  deleteAnnouncement(item: any) {
    this.apiService.deleteAnnouncement(item.id).subscribe({
      next: () => {
        this.snackBar.open('Announcement deleted', 'Close', { duration: 3000 });
        this.loadAnnouncements();
      },
      error: () => this.snackBar.open('Failed to delete', 'Close', { duration: 3000 })
    });
  }
}
