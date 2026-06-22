import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RestaurantService } from '../services/restaurant.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  restaurants: any[] = [];
  loading = false;
  error: string | null = null;
  showUpdateForm = false;
  updateForm!: FormGroup;
  updateLoading = false;
  updateError: string | null = null;
  updateSuccess: string | null = null;
  userId: number | null = null;

  constructor(
    private restaurantService: RestaurantService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.initializeUpdateForm();
  }

  ngOnInit() {
    this.loadRestaurants();
    this.loadUserProfile();
  }

  initializeUpdateForm() {
    this.updateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      role: ['USER'],
    });
  }

  loadUserProfile() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userId = user.id;
        this.updateForm.patchValue({
          email: user.email,
          username: user.username,
          password: user.password,
          role: user.role,
        });
        // Mark form as pristine and untouched to ensure it's valid
        this.updateForm.markAsPristine();
        this.updateForm.markAsUntouched();
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

  toggleUpdateForm() {
    this.showUpdateForm = !this.showUpdateForm;
    this.updateError = null;
    this.updateSuccess = null;
  }

  updateUser() {
    if (!this.updateForm.valid || !this.userId) {
      this.updateError = 'Please fill all fields correctly';
      return;
    }

    this.updateLoading = true;
    this.updateError = null;
    this.updateSuccess = null;

    // Disable form controls during API call
    this.updateForm.disable();

    this.userService.updateUser(this.updateForm.value, this.userId).subscribe({
      next: (res: any) => {
        this.updateSuccess = 'Profile updated successfully!';
        localStorage.setItem('user', JSON.stringify(res));
        this.updateLoading = false;
        // Re-enable form controls
        this.updateForm.enable();
        setTimeout(() => {
          this.showUpdateForm = false;
          this.updateSuccess = null;
        }, 2000);
      },
      error: (err: any) => {
        this.updateError = `Failed to update profile. ${err.error?.message || 'Please try again.'}`;
        this.updateLoading = false;
        // Re-enable form controls on error
        this.updateForm.enable();
      },
    });
  }

  cancelUpdate() {
    this.showUpdateForm = false;
    this.updateError = null;
    this.updateSuccess = null;
    this.loadUserProfile();
  }

  viewProducts(id: number) {
    console.log('Clicked ID:', id);
    this.router.navigate(['/products', id]);
  }

  loadRestaurants() {
    this.loading = true;
    this.error = null;
    this.restaurantService.getAllRestaurants().subscribe({
      next: (res: any) => {
        console.log('Restaurants loaded:', res);
        this.restaurants = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading restaurants:', err);
        this.error = `Failed to load restaurants. Please try again. (${err.status || 'Error'})`;
        this.restaurants = [];
        this.loading = false;
      },
    });
  }
}
