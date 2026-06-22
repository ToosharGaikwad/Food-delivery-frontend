import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  addProduct(product: any) {
    return this.http.post(`${this.apiUrl}/add`, product);
  }

  getAllProducts() {
    return this.http.get(this.apiUrl);
  }

  getProductsByRestaurant(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: number, product: any) {
    return this.http.put(`${this.apiUrl}/update/${id}`, product);
  }
}
