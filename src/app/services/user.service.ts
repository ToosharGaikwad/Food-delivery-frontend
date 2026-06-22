import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  login(emailId: string, password: string) {
    const body = {
      email: emailId, // 👈 EXACT match
      password: password,
    };

    return this.http.post(`${this.apiUrl}/login`, body);
  }

  register(user: any) {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  updateUser(user: any, id: number) {
    return this.http.put(`${this.apiUrl}/update/${id}`, user);
  }

  getUserById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
