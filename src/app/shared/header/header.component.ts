// header.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Angular Material imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../services/auth/auth.service';
@Component({
  selector: 'app-header', 
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  notificationsCount = signal(3);
  AuthService = inject(AuthService);
  userName = signal('');
  userEmail = signal('');

  constructor(private authService: AuthService, private router: Router) {}


  getUserNameFromToken(): string | null {
    const token = this?.AuthService.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);
      this.userName.set(parsed?.unique_name || 'Admin User');
      this.userEmail.set(parsed?.email || '');
      return parsed?.unique_name || null;
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }
  user = signal({
    name: this.getUserNameFromToken() || 'Admin User',
    email: this.userEmail() || '',
    avatar: `https://ui-avatars.com/api/?name=${this.getUserNameFromToken()}&background=0D8ABC&color=fff`
  })

  clearNotifications() {
    this.notificationsCount.set(0);
  }

  logout() {
    this.AuthService.logout();
    this.router.navigate(['/login']);
  }

}