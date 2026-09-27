import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  audience: string;
  date: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private announcements = new BehaviorSubject<Announcement[]>([]);

  announcements$ = this.announcements.asObservable();
  private nextId = 1;

  addAnnouncement(data: Partial<Announcement>) {
    const current = this.announcements.value;
    const newAnnouncement: Announcement = {
      id: this.nextId++,
      title: data.title || '',
      message: data.message || '',
      priority: data.priority || 'normal',
      audience: data.audience || 'All Residents',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      author: 'Admin'
    };
    this.announcements.next([newAnnouncement, ...current]);
  }

  deleteAnnouncement(id: number) {
    const current = this.announcements.value;
    this.announcements.next(current.filter(a => a.id !== id));
  }

  getForAudience(audience: string) {
    return this.announcements.value.filter(a => 
      a.audience === 'All Residents' || a.audience === audience
    );
  }
}
