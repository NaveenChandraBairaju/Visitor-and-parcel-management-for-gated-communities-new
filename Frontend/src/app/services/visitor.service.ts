import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FrequentVisitorService } from './frequent-visitor.service';
import { ActivityService } from './activity.service';

export interface Visitor {
  id: number;
  name: string;
  phone: string;
  purpose: string;
  flatNumber: string;
  vehicleNumber?: string;
  idProof?: string;
  photo?: string;
  checkIn: string;
  checkOut?: string;
  status: 'new' | 'waiting' | 'approved' | 'rejected' | 'entered' | 'exited';
  date: string;
  isFrequent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VisitorService {
  private frequentVisitorService = inject(FrequentVisitorService);
  private activityService = inject(ActivityService);
  private visitors = new BehaviorSubject<Visitor[]>([]);

  visitors$ = this.visitors.asObservable();
  private nextId = 1;



  addVisitor(visitor: Partial<Visitor>) {
    const current = this.visitors.value;
    const newVisitor: Visitor = {
      id: this.nextId++,
      name: visitor.name || '',
      phone: visitor.phone || '',
      purpose: visitor.purpose || '',
      flatNumber: visitor.flatNumber || '',
      vehicleNumber: visitor.vehicleNumber,
      idProof: visitor.idProof,
      photo: visitor.photo,
      checkIn: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      status: 'waiting',
      date: 'Today'
    };
    this.visitors.next([newVisitor, ...current]);
    return newVisitor;
  }

  approveVisitor(id: number) {
    const visitor = this.visitors.value.find(v => v.id === id);
    if (visitor) {
      this.activityService.addActivity('visitor_approved', `Visitor Approved - ${visitor.name}`, visitor.flatNumber);
    }
    this.updateStatus(id, 'approved');
  }

  rejectVisitor(id: number) {
    const visitor = this.visitors.value.find(v => v.id === id);
    if (visitor) {
      this.activityService.addActivity('visitor_rejected', `Visitor Rejected - ${visitor.name}`, visitor.flatNumber);
    }
    this.updateStatus(id, 'rejected');
  }

  markEntered(id: number) {
    const visitor = this.visitors.value.find(v => v.id === id);
    if (visitor) {
      this.frequentVisitorService.recordVisit(visitor.phone, visitor.flatNumber);
      this.activityService.addActivity('visitor_entered', `Visitor Entry - ${visitor.name}`, visitor.flatNumber);
    }
    this.updateStatus(id, 'entered');
  }

  markExited(id: number) {
    const visitor = this.visitors.value.find(v => v.id === id);
    if (visitor) {
      this.activityService.addActivity('visitor_exited', `Visitor Exit - ${visitor.name}`, visitor.flatNumber);
    }
    const current = this.visitors.value;
    const updated = current.map(v => v.id === id ? { 
      ...v, 
      status: 'exited' as const,
      checkOut: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    } : v);
    this.visitors.next(updated);
  }

  private updateStatus(id: number, status: Visitor['status']) {
    const current = this.visitors.value;
    const updated = current.map(v => v.id === id ? { ...v, status } : v);
    this.visitors.next(updated);
  }

  getVisitorsForFlat(flatNumber: string) {
    return this.visitors.value.filter(v => v.flatNumber === flatNumber);
  }

  getWaitingForFlat(flatNumber: string) {
    return this.visitors.value.filter(v => v.flatNumber === flatNumber && v.status === 'waiting');
  }

  getEnteredVisitors() {
    return this.visitors.value.filter(v => v.status === 'entered');
  }

  getApprovedVisitors() {
    return this.visitors.value.filter(v => v.status === 'approved');
  }

  getTodayCount() {
    return this.visitors.value.filter(v => v.date === 'Today').length;
  }

  getWaitingCount() {
    return this.visitors.value.filter(v => v.status === 'waiting').length;
  }
}
