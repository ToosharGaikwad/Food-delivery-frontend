import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { OrderService } from '../order-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../payment-service.service';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
declare var Razorpay: any;
@Component({
  selector: 'app-product',
  imports: [CommonModule, FormsModule],
  styleUrl: './product.component.css',
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  products: any[] = [];
  restaurantId!: number;
  cart: any[] = [];
  showCart = false;
  userId: number = 1; // Default user ID, can be fetched from auth
  loading = false;
  error: string | null = null;
  latestOrderId: number | null = null; // ✅ add this field

  // inside checkout() → orderService.placeOrder subscribe next:

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
    private http: HttpClient,
    private paymentService: PaymentService,
  ) {}

  ngOnInit() {
    // Get user ID from localStorage if available
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.userId = Number(storedUserId);
    }

    this.route.paramMap.subscribe((params) => {
      this.restaurantId = Number(params.get('id'));

      console.log('Restaurant ID:', this.restaurantId);

      if (this.restaurantId) {
        this.loadProducts();
      } else {
        console.error('ID is missing!');
      }
    });
  }

  addToCart(product: any) {
    const cartItem = this.cart.find((item) => item.id === product.id);

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }

    alert(`${product.name} added to cart!`);
    console.log('Cart:', this.cart);
  }

  removeFromCart(productId: number) {
    this.cart = this.cart.filter((item) => item.id !== productId);
  }

  increaseQuantity(productId: number) {
    const item = this.cart.find((item) => item.id === productId);
    if (item) {
      item.quantity += 1;
    }
  }

  decreaseQuantity(productId: number) {
    const item = this.cart.find((item) => item.id === productId);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
    }
  }

  getTotalPrice() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }
  checkout() {
    if (this.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const orderData = {
      paymentMode: 'ONLINE', // ✅ required by backend
      restaurantId: this.restaurantId,
      items: this.cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    console.log('Placing order:', orderData);

    this.orderService.placeOrder(orderData).subscribe({
      next: (orderResponse: any) => {
        console.log('Order placed successfully:', orderResponse);
        const orderId = orderResponse.orderId;
        this.latestOrderId = orderId; // Save latest orderId
        console.log('Order ID:', orderId);
        // Now create Razorpay payment order
        this.paymentService.createOrder(orderId).subscribe({
          next: (paymentResponse: any) => {
            console.log('Payment response:', paymentResponse);
            this.openRazorpay(paymentResponse, orderId); // Pass orderId
          },
          error: (err: any) => {
            console.error('Payment creation failed:', err);
            alert('Payment creation failed. Please try again.');
          },
        });
      },
      error: (error: any) => {
        console.error('Error placing order:', error);
        alert(
          'Error placing order: ' + (error.error?.message || error.message),
        );
      },
    });
  }
  openRazorpay(response: any, orderId?: number) {
    const options = {
      key: 'rzp_test_Sq4Unk8n88bXHr',

      amount: response.amount * 100,

      currency: 'INR',

      name: 'Food Delivery',

      description: 'Food Payment',

      order_id: response.razorpayOrderId,

      handler: (paymentResponse: any) => {
        console.log('Payment Success', paymentResponse);
        const verifyData = {
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          orderId: orderId || response.orderId,
        };
        this.paymentService.verifyPayment(verifyData).subscribe({
          next: (res: any) => {
            console.log(res);
            alert('Order Confirmed Successfully');
            this.cart = [];
            this.latestOrderId = verifyData.orderId; // Save latest orderId after confirmation
          },
          error: (err: any) => {
            console.log(err);
            alert('Payment Verification Failed');
          },
        });
      },

      prefill: {
        name: 'Tushar',
        email: 'gaikwadtushar710@gmail.com',
      },

      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new Razorpay(options);

    rzp.open();
  }
  loadProducts() {
    this.loading = true;
    this.error = null;
    this.productService.getProductsByRestaurant(this.restaurantId).subscribe({
      next: (res: any) => {
        console.log('Products loaded:', res);
        this.products = Array.isArray(res) ? res : [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.error = `Failed to load products. Please try again. (${err.status || 'Error'})`;
        this.products = [];
        this.loading = false;
      },
    });
  }

  downloadReceipt(orderId: number | null) {
    console.log('📥 downloadReceipt called with orderId:', orderId);

    if (!orderId) {
      alert('❌ Order ID not found. Please complete an order first.');
      console.error('Download receipt failed: orderId is null or undefined');
      return;
    }

    const token = localStorage.getItem('token');
    const apiUrl = `http://localhost:8080/receipt/${orderId}`;
    console.log('🔗 Requesting receipt from:', apiUrl);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .get(apiUrl, {
        headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          console.log('✅ Receipt downloaded successfully');
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt-${orderId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('❌ Receipt download failed:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          alert(
            `Failed to download receipt: ${error.status} ${error.statusText || error.message}`,
          );
        },
      });
  }

  onSelectRestaurant(id: number): void {
    this.productService.getProductsByRestaurant(id).subscribe({
      next: (res: any) => {
        this.products = res;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}
