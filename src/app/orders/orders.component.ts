import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../order-service.service';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../payment-service.service';
declare var Razorpay: any;

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  private orderApi = 'http://localhost:8080/orders';

  // orders.component.ts
  newOrder = {
    paymentMode: 'ONLINE', // ✅ Add this
    userId: 1,
    restaurantId: 1,
    items: [{ productId: 1, quantity: 1 }],
  };

  constructor(
    private orderService: OrderService,
    private http: HttpClient,
    private paymentService: PaymentService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // ✅ Load all orders
  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data: any) => {
        console.log('Orders loaded:', data);
        this.orders = data || [];
      },
      error: (err: any) => {
        console.error('Error loading orders:', err);
      },
    });
  }

  // ✅ Update order status
  updateStatus(id: number, status: string) {
    this.http.put(`${this.orderApi}/${id}/status`, { status }).subscribe({
      next: () => {
        alert('Status updated!');
        this.loadOrders();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Error updating status');
      },
    });
  }

  // ✅ Place order
  placeOrder() {
    this.orderService.placeOrder(this.newOrder).subscribe({
      next: (orderResponse: any) => {
        console.log(orderResponse);

        const orderId = orderResponse.id; // ✅ Correct

        // create razorpay order
        this.paymentService.createOrder(orderId).subscribe({
          next: (paymentResponse: any) => {
            console.log(paymentResponse);

            this.openRazorpay(paymentResponse);
          },

          error: (err: any) => {
            console.error(err);
          },
        });
      },

      error: (err: any) => {
        console.error(err);
      },
    });
  }

  openRazorpay(response: any) {
    const options = {
      key: 'rzp_test_SjzVLofk9UEl3y',

      amount: response.amount,

      currency: 'INR',

      name: 'Food Delivery',

      description: 'Food Payment',

      order_id: response.razorpayOrderId,

      handler: (response: any) => {
        console.log('Payment Success', response);

        const paymentData = {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        };
        // confirm order
        this.http
          .post(`http://localhost:8080/orders/confirm/${response.orderId}`, {})
          .subscribe({
            next: () => {
              alert('Payment Successful');

              this.loadOrders();
            },
          });
      },

      modal: {
        ondismiss: () => {
          console.log('Payment Cancelled');

          this.http
            .post(`http://localhost:8080/orders/fail/${response.orderId}`, {})
            .subscribe();
        },
      },

      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new Razorpay(options);

    rzp.open();
  }
}
