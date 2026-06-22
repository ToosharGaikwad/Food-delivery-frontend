// src/app/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please fill all fields';
      return;
    }

    this.loading = true;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        console.log('✅ Login Response:', res);
        console.log('✅ Token from response:', res.token);
        console.log('✅ Role from response:', res.role);

        this.auth.saveAuthData(res.token, res.role);

        console.log(
          '✅ Saved to localStorage - Token:',
          localStorage.getItem('token'),
        );
        console.log(
          '✅ Saved to localStorage - Role:',
          localStorage.getItem('role'),
        );

        // 🔥 ROLE BASED REDIRECT
        if (res.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => {
        console.error('❌ Login Error:', err);
        this.error = err.error?.message || 'Login failed';
        this.loading = false;
      },
    });
  }
}
