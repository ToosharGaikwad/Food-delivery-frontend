// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./product/product.component').then((m) => m.ProductComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./orders/orders.component').then((m) => m.OrdersComponent),
  },
];
