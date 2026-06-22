import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = 'http://localhost:8080/payment';

  constructor(private http: HttpClient) {}

  createOrder(orderId: number) {
    return this.http.post(`${this.baseUrl}/create/${orderId}`, {});
  }

  verifyPayment(data: any) {
    return this.http.post(`${this.baseUrl}/verify`, data);
  }

  // ✅ Download Receipt
  downloadReceipt(orderId: number) {
    const apiUrl = `http://localhost:8080/receipt/${orderId}`;
    console.log('📄 PaymentService: Downloading receipt from:', apiUrl);
    return this.http.get(apiUrl, {
      responseType: 'blob',
    });
  }
}
