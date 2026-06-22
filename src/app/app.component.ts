import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth-service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private http: HttpClient,
  ) {}

  logout() {
    this.authService.logout();
  }
  downloadLatestReceipt() {
    const orderId = localStorage.getItem('latestOrderId');

    if (!orderId) {
      alert('No recent order found');

      return;
    }

    this.http
      .get(`http://localhost:8080/receipt/${orderId}`, {
        responseType: 'blob',
      })
      .subscribe((response: Blob) => {
        const blob = new Blob([response], {
          type: 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;

        link.download = `receipt-${orderId}.pdf`;

        link.click();
      });
  }
}
