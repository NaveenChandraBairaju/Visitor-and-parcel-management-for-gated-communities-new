import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, userData);
  }

  googleLogin(email: string, name: string, googleId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google-login`, { email, name, googleId });
  }

  getResidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/residents`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/stats/dashboard`);
  }

  getAllVisitors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/visitors`);
  }

  getVisitorsByResident(residentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/visitors/resident/${residentId}`);
  }

  getPendingVisitors(residentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/visitors/pending/${residentId}`);
  }

  logVisitor(visitorData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/visitors`, visitorData);
  }

  updateVisitorStatus(id: number, status: string, notes?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/visitors/${id}/status`, { status, notes });
  }

  getAllParcels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/parcels`);
  }

  getParcelsByResident(residentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/parcels/resident/${residentId}`);
  }

  logParcel(parcelData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/parcels`, parcelData);
  }

  updateParcelStatus(id: number, status: string, notes?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/parcels/${id}/status`, { status, notes });
  }

  getAllPreApproved(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/preapprove`);
  }

  getPreApprovedHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/preapprove/history`);
  }

  getPreApprovedByResident(residentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/preapprove/resident/${residentId}`);
  }

  addPreApproved(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/preapprove`, data);
  }

  updatePreApprovedStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/preapprove/${id}/status`, { status });
  }

  deletePreApproved(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/preapprove/${id}`);
  }

  getAllAnnouncements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/announcements`);
  }

  getAnnouncementsByAudience(audience: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/announcements/audience/${audience}`);
  }

  createAnnouncement(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/announcements`, data);
  }

  deleteAnnouncement(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/announcements/${id}`);
  }

  getRecentVisitorHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/visitors/history/recent`);
  }

  getRecentParcelHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/parcels/history/recent`);
  }

  // Frequent Visitors
  getAllFrequentVisitors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/frequent-visitors`);
  }

  getFrequentVisitorsByResident(residentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/frequent-visitors/resident/${residentId}`);
  }

  searchFrequentVisitors(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/frequent-visitors/search?query=${query}`);
  }

  addFrequentVisitor(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/frequent-visitors`, data);
  }

  deleteFrequentVisitor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/frequent-visitors/${id}`);
  }
}
