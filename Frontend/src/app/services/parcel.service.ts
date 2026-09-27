import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivityService } from './activity.service';

export interface Parcel {
  id: number;
  courier: string;
  name: string;
  flatNumber: string;
  recipientName: string;
  receivedDate: string;
  receivedTime: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Acknowledged' | 'Collected';
  description?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  deliveryPersonArrived?: string;
  deliveryPersonLeft?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private activityService = inject(ActivityService);
  private parcels = new BehaviorSubject<Parcel[]>([]);

  parcels$ = this.parcels.asObservable();
  private nextId = 1;



  addParcel(parcel: Partial<Parcel>) {
    const current = this.parcels.value;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const newParcel: Parcel = {
      id: this.nextId++,
      courier: parcel.courier || 'Other',
      name: parcel.name || '',
      flatNumber: parcel.flatNumber || '',
      recipientName: parcel.recipientName || '',
      receivedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      receivedTime: now,
      status: 'Pending',
      description: parcel.description,
      deliveryPersonName: parcel.deliveryPersonName,
      deliveryPersonPhone: parcel.deliveryPersonPhone,
      deliveryPersonArrived: now,
      deliveryPersonLeft: undefined
    };
    this.parcels.next([newParcel, ...current]);
    this.activityService.addActivity('parcel_received', `Parcel Arrived - ${newParcel.courier} for ${newParcel.flatNumber}`, newParcel.flatNumber);
    return newParcel;
  }

  markDeliveryPersonLeft(id: number) {
    const current = this.parcels.value;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const updated = current.map(p => p.id === id ? { ...p, deliveryPersonLeft: now } : p);
    this.parcels.next(updated);
  }

  approveParcel(id: number) {
    const parcel = this.parcels.value.find(p => p.id === id);
    if (parcel) {
      this.activityService.addActivity('parcel_received', `Parcel Approved - ${parcel.courier} Package`, parcel.flatNumber);
    }
    this.updateStatus(id, 'Approved');
  }

  rejectParcel(id: number) {
    const parcel = this.parcels.value.find(p => p.id === id);
    if (parcel) {
      this.activityService.addActivity('parcel_collected', `Parcel Rejected - ${parcel.courier} Package`, parcel.flatNumber);
    }
    this.updateStatus(id, 'Rejected');
  }

  acknowledgeParcel(id: number) {
    this.updateStatus(id, 'Acknowledged');
  }

  collectParcel(id: number) {
    const parcel = this.parcels.value.find(p => p.id === id);
    if (parcel) {
      this.activityService.addActivity('parcel_collected', `Parcel Collected - ${parcel.courier} Package`, parcel.flatNumber);
    }
    this.updateStatus(id, 'Collected');
  }

  private updateStatus(id: number, status: Parcel['status']) {
    const current = this.parcels.value;
    const updated = current.map(p => p.id === id ? { ...p, status } : p);
    this.parcels.next(updated);
  }

  getParcelsForFlat(flatNumber: string) {
    return this.parcels.value.filter(p => p.flatNumber === flatNumber);
  }

  getPendingForFlat(flatNumber: string) {
    return this.parcels.value.filter(p => p.flatNumber === flatNumber && p.status === 'Pending');
  }

  getTodayCount() {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return this.parcels.value.filter(p => p.receivedDate === today || p.receivedDate === '18 Dec 2025').length;
  }

  getTotalCount() {
    return this.parcels.value.length;
  }
}
