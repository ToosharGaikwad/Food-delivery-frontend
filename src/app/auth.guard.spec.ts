import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = localStorage.getItem('role');

    if (!role) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles = route.data['roles'];

    if (allowedRoles && !allowedRoles.includes(role)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
