import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PreApprovedVisitor {
  id: number;
  name: string;
  phone: string;
  purpose: string;
  expectedDate: string;
  flatNumber: string;
  residentName: string;
  status: string;
  vehicleNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreApproveService {
  private preApprovedList = new BehaviorSubject<PreApprovedVisitor[]>([]);

  preApprovedList$ = this.preApprovedList.asObservable();

  private nextId = 1;

  addPreApproval(visitor: Partial<PreApprovedVisitor>, flatNumber: string, residentName: string) {
    const current = this.preApprovedList.value;
    const newVisitor: PreApprovedVisitor = {
      id: this.nextId++,
      name: visitor.name || '',
      phone: visitor.phone || '',
      purpose: visitor.purpose || '',
      expectedDate: visitor.expectedDate || 'Today',
      flatNumber: flatNumber,
      residentName: residentName,
      status: 'Active',
      vehicleNumber: visitor.vehicleNumber
    };
    this.preApprovedList.next([newVisitor, ...current]);
  }

  cancelApproval(id: number) {
    const current = this.preApprovedList.value;
    const updated = current.map(v => v.id === id ? { ...v, status: 'Cancelled' } : v);
    this.preApprovedList.next(updated);
  }

  markAsEntered(id: number) {
    const current = this.preApprovedList.value;
    const updated = current.map(v => v.id === id ? { ...v, status: 'Entered' } : v);
    this.preApprovedList.next(updated);
  }

  getActiveList() {
    return this.preApprovedList.value.filter(v => v.status === 'Active' || v.status === 'Pending');
  }

  getTodayList() {
    return this.preApprovedList.value.filter(v => 
      (v.status === 'Active' || v.status === 'Pending') && 
      (v.expectedDate === 'Today' || v.expectedDate === new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
    );
  }
}
