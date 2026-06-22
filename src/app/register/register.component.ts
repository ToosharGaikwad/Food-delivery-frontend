import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private userService: UserService) {}

  register() {
    this.loading = true;
    this.error = '';
    const user = {
      email: this.email,
      username: this.username,
      password: this.password,
    };

    this.userService.register(user).subscribe({
      next: (res: any) => {
        this.loading = false;
        alert('Registration Successful');
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed';
      },
    });
  }
}
