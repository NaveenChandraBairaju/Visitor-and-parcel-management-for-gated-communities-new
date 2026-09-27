import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Activity {
  id: number;
  type: 'visitor_approved' | 'visitor_rejected' | 'visitor_entered' | 'visitor_exited' | 'parcel_received' | 'parcel_collected';
  title: string;
  flatNumber: string;
  time: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private nextId = 1;
  private activities = new BehaviorSubject<Activity[]>([]);
  
  activities$ = this.activities.asObservable();

  addActivity(type: Activity['type'], title: string, flatNumber: string) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const activity: Activity = {
      id: this.nextId++,
      type,
      title,
      flatNumber,
      time,
      date: 'Today'
    };
    
    const current = this.activities.value;
    this.activities.next([activity, ...current].slice(0, 50));
  }

  getForFlat(flatNumber: string): Activity[] {
    return this.activities.value.filter(a => a.flatNumber === flatNumber);
  }

  getAll(): Activity[] {
    return this.activities.value;
  }

  getRecent(limit: number = 5, flatNumber?: string): Activity[] {
    let list = this.activities.value;
    if (flatNumber) {
      list = list.filter(a => a.flatNumber === flatNumber);
    }
    return list.slice(0, limit);
  }
}
