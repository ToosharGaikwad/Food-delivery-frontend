import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItemDTO {
  productId: number;
  quantity: number;
}

export interface OrderRequestDTO {
  paymentMode: string;
  restaurantId: number;
  items: OrderItemDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  // ✅ Confirm Order
  confirmOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/confirm/${orderId}`, {});
  }
  private baseUrl = 'http://localhost:8080/orders';

  constructor(private http: HttpClient) {}

  // ✅ Place Order
  placeOrder(order: OrderRequestDTO): Observable<any> {
    const token = localStorage.getItem('token');

    console.log('TOKEN:', token); // debug

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    return this.http.post(this.baseUrl, order, { headers });
  }

  // ✅ Get Order by ID
  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // ✅ Get All Orders
  getAllOrders(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
  downloadReceipt(orderId: number) {
    const apiUrl = `http://localhost:8080/receipt/${orderId}`;
    console.log('📄 OrderService: Downloading receipt from:', apiUrl);
    return this.http.get(apiUrl, {
      responseType: 'blob',
    });
  }
}
