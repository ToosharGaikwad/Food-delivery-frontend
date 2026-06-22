// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }

  saveAuthData(token: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }

  getRole() {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      // Call the backend logout endpoint
      this.http
        .post(
          `${this.apiUrl}/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .subscribe({
          next: () => {
            this.clearAuthData();
          },
          error: () => {
            // Even if the endpoint fails, clear local storage
            this.clearAuthData();
          },
        });
    } else {
      this.clearAuthData();
    }
  }

  private clearAuthData() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
