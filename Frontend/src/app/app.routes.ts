import { Routes } from '@angular/router';
import { residentGuard, securityGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'resident',
    loadComponent: () => import('./resident/resident-layout/resident-layout.component').then(m => m.ResidentLayoutComponent),
    canActivate: [residentGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./resident/resident-home/resident-home.component').then(m => m.ResidentHomeComponent)
      },
      {
        path: 'visitor-approval',
        loadComponent: () => import('./resident/visitor-approval/resident-approval.component').then(m => m.ResidentApprovalComponent)
      },
      {
        path: 'parcel-tracking',
        loadComponent: () => import('./resident/parcel-tracking/resident-parcel.component').then(m => m.ResidentParcelComponent)
      },
      {
        path: 'pre-approve',
        loadComponent: () => import('./resident/pre-approve/pre-approve.component').then(m => m.PreApproveComponent)
      },
      {
        path: 'frequent-visitors',
        loadComponent: () => import('./resident/frequent-visitors/frequent-visitors.component').then(m => m.FrequentVisitorsComponent)
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: 'security',
    loadComponent: () => import('./security/security-layout/security-layout.component').then(m => m.SecurityLayoutComponent),
    canActivate: [securityGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./security/security-home/security-home.component').then(m => m.SecurityHomeComponent)
      },
      {
        path: 'visitor-log',
        loadComponent: () => import('./security/visitor-log/visitor-log.component').then(m => m.VisitorLogComponent)
      },
      {
        path: 'parcel-log',
        loadComponent: () => import('./security/parcel-log/parcel-log.component').then(m => m.ParcelLogComponent)
      },
      {
        path: 'all-visitors',
        loadComponent: () => import('./security/all-visitors/all-visitors.component').then(m => m.AllVisitorsComponent)
      },
      {
        path: 'all-parcels',
        loadComponent: () => import('./security/all-parcels/all-parcels.component').then(m => m.AllParcelsComponent)
      },
      {
        path: 'pre-approved',
        loadComponent: () => import('./security/pre-approved/pre-approved.component').then(m => m.PreApprovedComponent)
      },
      {
        path: 'frequent-visitors',
        loadComponent: () => import('./security/frequent-visitors/frequent-visitors.component').then(m => m.SecurityFrequentVisitorsComponent)
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'visitors',
        loadComponent: () => import('./security/all-visitors/all-visitors.component').then(m => m.AllVisitorsComponent)
      },
      {
        path: 'parcels',
        loadComponent: () => import('./security/all-parcels/all-parcels.component').then(m => m.AllParcelsComponent)
      },
      {
        path: 'pre-approved',
        loadComponent: () => import('./security/pre-approved/pre-approved.component').then(m => m.PreApprovedComponent)
      },
      {
        path: 'announcements',
        loadComponent: () => import('./admin/announcements/announcements.component').then(m => m.AnnouncementsComponent)
      },
      {
        path: 'frequent-visitors',
        loadComponent: () => import('./security/frequent-visitors/frequent-visitors.component').then(m => m.SecurityFrequentVisitorsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
