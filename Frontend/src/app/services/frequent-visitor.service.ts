import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FrequentVisitor {
  id: number;
  name: string;
  phone: string;
  relation: string;
  flatNumber: string;
  visits: number;
  lastVisit: string;
}

@Injectable({
  providedIn: 'root'
})
export class FrequentVisitorService {
  private nextId = 1;
  
  private frequentVisitors = new BehaviorSubject<FrequentVisitor[]>([]);

  frequentVisitors$ = this.frequentVisitors.asObservable();

  getForFlat(flatNumber: string): FrequentVisitor[] {
    return this.frequentVisitors.value.filter(v => v.flatNumber === flatNumber);
  }

  addFrequentVisitor(visitor: Partial<FrequentVisitor>): FrequentVisitor {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newVisitor: FrequentVisitor = {
      id: this.nextId++,
      name: visitor.name || '',
      phone: visitor.phone || '',
      relation: visitor.relation || 'Other',
      flatNumber: visitor.flatNumber || 'A-101',
      visits: 0,
      lastVisit: today
    };
    this.frequentVisitors.next([newVisitor, ...this.frequentVisitors.value]);
    return newVisitor;
  }

  removeFrequentVisitor(id: number) {
    const updated = this.frequentVisitors.value.filter(v => v.id !== id);
    this.frequentVisitors.next(updated);
  }

  isFrequentVisitor(phone: string, flatNumber: string): FrequentVisitor | undefined {
    return this.frequentVisitors.value.find(
      v => v.phone === phone && v.flatNumber === flatNumber
    );
  }

  recordVisit(phone: string, flatNumber: string) {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const updated = this.frequentVisitors.value.map(v => {
      if (v.phone === phone && v.flatNumber === flatNumber) {
        return { ...v, visits: v.visits + 1, lastVisit: today };
      }
      return v;
    });
    this.frequentVisitors.next(updated);
  }
}
