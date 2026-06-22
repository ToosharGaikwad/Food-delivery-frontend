import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  section: string = 'products';

  products: any[] = [];
  orders: any[] = [];
  restaurants: any[] = [];

  newProduct = {
    name: '',
    price: 0,
    restaurantId: 0,
    category: '',
    available: true,
  };

  newRestaurant = {
    name: '',
    address: '',
    rating: 0,
    isopen: true,
  };

  editingProductId: number | null = null;
  editProduct = {
    name: '',
    price: 0,
    category: '',
    available: true,
    restaurantId: 0,
  };

  editingRestaurantId: number | null = null;
  editRestaurant = {
    name: '',
    address: '',
    rating: 0,
    isopen: true,
  };

  private productApi = 'http://localhost:8080/api/products';
  private orderApi = 'http://localhost:8080/orders';
  private restaurantApi = 'http://localhost:8080/res';

  constructor(private http: HttpClient) {
    this.debugToken();
  }

  debugToken() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('=== TOKEN DEBUG ===');
    console.log('Token stored:', token ? 'Yes' : 'No');
    console.log('Role stored:', role);

    if (token) {
      try {
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length === 3) {
          // Decode the payload (second part)
          const payload = JSON.parse(atob(parts[1]));
          console.log('JWT Payload:', payload);
          console.log('Token expiry:', new Date(payload.exp * 1000));
          console.log('Current time:', new Date());
        } else {
          console.warn(
            'Token is not a valid JWT (expected 3 parts, got ' +
              parts.length +
              ')',
          );
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
    this.loadRestaurants();
  }

  // ================= PRODUCTS =================

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadProducts() {
    this.http
      .get<any[]>(this.productApi, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          this.products = res;
        },
        error: (err) => console.log('❌ Error loading products:', err),
      });
  }

  addProduct() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    console.log('Token:', token ? 'EXISTS' : 'MISSING');
    console.log('Role:', role);

    const payload = {
      name: this.newProduct.name,
      price: this.newProduct.price,
      category: this.newProduct.category,
      available: this.newProduct.available,
      restaurant: {
        id: this.newProduct.restaurantId,
      },
    };

    // ✅ MANUALLY add Authorization header
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    console.log(
      'Sending request with header:',
      `Bearer ${token ? 'TOKEN_PRESENT' : 'NO_TOKEN'}`,
    );

    this.http.post(this.productApi + '/add', payload, { headers }).subscribe({
      next: () => {
        alert('✅ Product added!');
        this.newProduct = {
          name: '',
          price: 0,
          restaurantId: 0,
          category: '',
          available: true,
        };
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error:', err.status);
        if (err.status === 403) {
          alert(
            '403 Access Denied - Check backend logs for Authorization header',
          );
        } else {
          alert('Failed to add product. Status: ' + err.status);
        }
      },
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    this.http
      .delete(`${this.productApi}/${id}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          alert('Product deleted!');
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Failed to delete product. Status: ' + err.status);
        },
      });
  }

  startEditProduct(product: any) {
    this.editingProductId = product.id;
    this.editProduct = {
      name: product.name,
      price: product.price,
      category: product.category,
      available: product.available,
      restaurantId: product.restaurant?.id || 0,
    };
  }

  updateProduct() {
    if (this.editingProductId === null) {
      return;
    }

    // Send only the basic product fields without nested restaurant object
    const payload = {
      name: this.editProduct.name,
      price: this.editProduct.price,
      category: this.editProduct.category,
      available: this.editProduct.available,
    };

    console.log('📤 Sending update payload:', JSON.stringify(payload, null, 2));
    console.log('🔑 Product ID:', this.editingProductId);

    this.http
      .put(`${this.productApi}/update/${this.editingProductId}`, payload, {
        headers: this.getAuthHeaders(),
      })
      .subscribe({
        next: () => {
          alert('✅ Product updated!');
          this.editingProductId = null;
          this.loadProducts();
        },
        error: (err) => {
          console.error('❌ Error updating product:', err);
          console.error('Response body:', err.error);
          console.error('Status:', err.status);
          console.error('Message:', err.message);
          alert('Failed to update product. Status: ' + err.status);
        },
      });
  }

  cancelEditProduct() {
    this.editingProductId = null;
  }

  // ================= ORDERS =================

  loadOrders() {
    this.http
      .get<any[]>(this.orderApi, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          console.log('Orders loaded:', res);
          this.orders = res || [];
          console.log('Orders assigned:', this.orders);
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          console.error('Status:', err.status);
          console.error('Message:', err.message);
          console.error('Response:', err.error);
        },
      });
  }

  updateStatus(id: number, status: string) {
    this.http
      .put(
        `${this.orderApi}/${id}/status`,
        { status },
        {
          headers: this.getAuthHeaders(),
        },
      )
      .subscribe({
        next: () => {
          alert('Status updated!');
          this.loadOrders();
        },
        error: (err) => {
          console.error('Error updating status:', err);
          alert('Failed to update status. Status: ' + err.status);
        },
      });
  }

  // ================= RESTAURANTS =================

  loadRestaurants() {
    this.http.get<any[]>(`${this.restaurantApi}/allRestaurant`).subscribe({
      next: (res) => {
        this.restaurants = res;
      },
      error: (err) => console.log(err),
    });
  }

  addRestaurant() {
    const payload = {
      name: this.newRestaurant.name,
      address: this.newRestaurant.address,
      rating: this.newRestaurant.rating,
      isopen: this.newRestaurant.isopen,
    };

    this.http
      .post(`${this.restaurantApi}/addRestaurant`, payload, {
        headers: this.getAuthHeaders(),
      })
      .subscribe({
        next: (res) => {
          console.log('Restaurant Added', res);
          alert('Restaurant Added Successfully');
          // refresh list
          this.loadRestaurants();
          // reset form
          this.newRestaurant = {
            name: '',
            address: '',
            rating: 0,
            isopen: true,
          };
        },
        error: (err) => {
          console.error('Error adding restaurant:', err);
          alert('Failed to add restaurant. Status: ' + err.status);
        },
      });
  }
  deleteRestaurant(id: number) {
    if (!confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log(
      '🔍 Delete attempt - Token:',
      token ? 'Present' : 'Missing',
      'Role:',
      role,
    );

    // ✅ After — headers included
    this.http
      .delete(`${this.restaurantApi}/id/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .subscribe({
        next: () => {
          alert('Restaurant deleted successfully!');
          this.loadRestaurants();
        },
        error: (err) => {
          console.error('❌ Error deleting restaurant:', err);
          console.error('Status:', err.status, 'Message:', err.message);
          alert('Failed to delete restaurant. Status: ' + err.status);
        },
      });
  }

  startEditRestaurant(restaurant: any) {
    this.editingRestaurantId = restaurant.id;
    this.editRestaurant = {
      name: restaurant.name,
      address: restaurant.address,
      rating: restaurant.rating,
      isopen: restaurant.isopen,
    };
  }

  updateRestaurant() {
    if (!this.editingRestaurantId) {
      alert('No restaurant selected for editing');
      return;
    }

    const payload = {
      name: this.editRestaurant.name,
      address: this.editRestaurant.address,
      rating: this.editRestaurant.rating,
      isopen: this.editRestaurant.isopen,
    };

    this.http
      .put(
        `${this.restaurantApi}/update/${this.editingRestaurantId}`,
        payload,
        {
          headers: this.getAuthHeaders(),
        },
      )
      .subscribe({
        next: (res) => {
          console.log('Restaurant Updated', res);
          alert('Restaurant Updated Successfully');
          this.cancelEdit();
          this.loadRestaurants();
        },
        error: (err) => {
          console.error('Error updating restaurant:', err);
          alert('Failed to update restaurant. Status: ' + err.status);
        },
      });
  }

  cancelEdit() {
    this.editingRestaurantId = null;
    this.editRestaurant = {
      name: '',
      address: '',
      rating: 0,
      isopen: true,
    };
  }
}
